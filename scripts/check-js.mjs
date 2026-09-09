#!/usr/bin/env node
/**
 * Verifica quanto JavaScript il sito manda davvero al browser.
 *
 * La regola del progetto non è «zero JavaScript», che con un video e un
 * visualizzatore 3D non sarebbe vera: è **nessuno script fuori dalle isole
 * dichiarate qui sotto, e ogni isola solo sulle pagine che la usano**.
 *
 * Fallisce se:
 *   - una pagina carica un'isola che non le è stata concessa;
 *   - in `dist/` compare un file JavaScript che non corrisponde a nessuna
 *     isola dichiarata (per esempio una libreria entrata di straforo);
 *   - una pagina contiene uno script eseguibile scritto dentro l'HTML, che
 *     oltre a essere fuori controllo sarebbe bloccato dalla CSP.
 *
 * I blocchi `<script type="application/ld+json">` non sono codice: sono i
 * dati strutturati per i motori di ricerca e vengono contati a parte.
 *
 * Uso: node scripts/check-js.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(radice, 'dist');

/**
 * Le isole ammesse, e su quali pagine.
 * Aggiungere un'isola qui è una decisione consapevole, non una svista.
 */
const ISOLE = [
  {
    nome: 'EroeVideo',
    perche: 'avvia e mette in pausa il video del hero, misura l\'intestazione',
    pagine: /^\/$/,
  },
  {
    nome: 'FormContatti',
    perche: 'invia il modulo senza ricaricare la pagina',
    pagine: /^\/contatti$/,
  },
  {
    nome: 'VisualizzatoreDisegni',
    perche: 'rende interattive le tavole 2D e i modelli 3D',
    // In home c'è il modello in vetrina, sulle schede lavoro le loro tavole.
    pagine: /^\/$|^\/progetti\/[^/]+$/,
  },
];

async function elencaFile(cartella, estensione) {
  const voci = await readdir(cartella, { withFileTypes: true });
  const trovati = [];
  for (const voce of voci) {
    const completo = path.join(cartella, voce.name);
    if (voce.isDirectory()) trovati.push(...(await elencaFile(completo, estensione)));
    else if (voce.name.endsWith(estensione)) trovati.push(completo);
  }
  return trovati;
}

function percorsoPagina(file) {
  const relativo = path.relative(dist, file).replaceAll(path.sep, '/');
  if (relativo === 'index.html') return '/';
  if (relativo === '404.html') return '/404';
  return `/${relativo.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`;
}

/** Dal nome del file emesso da Astro risale al componente che l'ha generato. */
function isolaDelFile(sorgente) {
  const nome = path.basename(sorgente);
  const trovata = ISOLE.find((isola) => nome.startsWith(`${isola.nome}.astro`));
  return trovata?.nome ?? null;
}

const pagine = (await elencaFile(dist, '.html')).sort();
const fileJs = (await elencaFile(dist, '.js')).sort();

const problemi = [];
const righe = [];
const isoleUsate = new Set();

for (const file of pagine) {
  const html = await readFile(file, 'utf8');
  const pagina = percorsoPagina(file);

  const tag = html.match(/<script\b[^>]*>/g) ?? [];
  const dati = tag.filter((t) => t.includes('application/ld+json')).length;
  const eseguibili = tag.filter((t) => !t.includes('application/ld+json'));

  const inMarkup = eseguibili.filter((t) => !/\ssrc=/.test(t));
  for (const t of inMarkup) {
    problemi.push(`${pagina}: script scritto dentro l'HTML — ${t.slice(0, 80)}`);
  }

  const isole = [];
  for (const t of eseguibili) {
    const sorgente = t.match(/\ssrc="([^"]+)"/)?.[1];
    if (!sorgente) continue;
    const isola = isolaDelFile(sorgente);
    if (!isola) {
      problemi.push(`${pagina}: script non riconducibile a nessuna isola — ${sorgente}`);
      continue;
    }
    isole.push(isola);
    isoleUsate.add(isola);

    const dichiarata = ISOLE.find((voce) => voce.nome === isola);
    if (!dichiarata?.pagine.test(pagina)) {
      problemi.push(`${pagina}: carica l'isola ${isola}, che non è ammessa su questa pagina`);
    }
  }

  righe.push({ pagina, isole, dati });
}

// file JavaScript in dist che non appartengono a nessuna isola
for (const file of fileJs) {
  if (isolaDelFile(file) === null) {
    problemi.push(`dist: file JavaScript estraneo — ${path.relative(dist, file)}`);
  }
}

const larghezza = Math.max(...righe.map((r) => r.pagina.length), 6);
console.log(`${'PAGINA'.padEnd(larghezza)}  ISOLE                            JSON-LD`);
console.log(`${'-'.repeat(larghezza)}  -------------------------------  -------`);
for (const riga of righe) {
  const isole = riga.isole.length > 0 ? riga.isole.join(', ') : '—';
  console.log(`${riga.pagina.padEnd(larghezza)}  ${isole.padEnd(31)}  ${String(riga.dati).padStart(7)}`);
}

console.log('\nIsole dichiarate:');
for (const isola of ISOLE) {
  const usata = isoleUsate.has(isola.nome);
  console.log(`  ${usata ? '·' : '!'} ${isola.nome.padEnd(22)} ${isola.perche}`);
  if (!usata) problemi.push(`isola dichiarata ma non usata da nessuna pagina: ${isola.nome}`);
}

const peso = (
  await Promise.all(fileJs.map(async (f) => (await readFile(f)).byteLength))
).reduce((somma, n) => somma + n, 0);

console.log(
  `\n${fileJs.length} file JavaScript in dist, ${(peso / 1024).toFixed(1)} kB in tutto.`
);

if (problemi.length > 0) {
  console.error(`\n${problemi.length} problemi:`);
  for (const problema of problemi) console.error(`  ${problema}`);
  process.exit(1);
}

console.log('Nessuno script fuori dalle isole dichiarate.');
