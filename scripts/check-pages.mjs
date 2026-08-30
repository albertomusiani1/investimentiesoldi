#!/usr/bin/env node
/**
 * Verifica che tutte le pagine pubblicate rispondano correttamente.
 *
 * 1. legge `dist/sitemap-index.xml`, segue le sitemap elencate ed estrae
 *    tutte le URL dichiarate;
 * 2. aggiunge le pagine volutamente escluse dalla sitemap (noindex);
 * 3. richiede ogni URL al server di anteprima;
 * 4. stampa una tabella URL / stato;
 * 5. controlla che ogni URL assoluto verso il dominio di produzione presente
 *    nell'HTML (canonical, og:image, JSON-LD) corrisponda a una risorsa reale;
 * 6. controlla che un indirizzo inesistente serva la 404 personalizzata;
 * 7. esce con codice 1 se anche una sola verifica non passa.
 *
 * Uso:
 *   npm run preview &
 *   node scripts/check-pages.mjs [http://localhost:4321]
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(radice, 'dist');
const base = (process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:4321').replace(/\/$/, '');

/** Pagine con noindex: non stanno in sitemap ma devono comunque rispondere 200. */
const PAGINE_EXTRA = ['/contatti/grazie', '/contatti/errore'];

/** Indirizzo inesistente usato per la verifica della pagina 404. */
const URL_INESISTENTE = '/questa-pagina-non-esiste-mai-12345';

/** Frammento che deve comparire nella 404 personalizzata. */
const FIRMA_404 = 'Questa pagina non esiste';

function estraiLoc(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

async function leggiSitemap() {
  const indice = await readFile(path.join(dist, 'sitemap-index.xml'), 'utf8');
  const file = estraiLoc(indice);

  if (file.length === 0) {
    throw new Error('sitemap-index.xml non elenca nessuna sitemap');
  }

  const urlTrovate = [];
  for (const riferimento of file) {
    const nome = path.basename(new URL(riferimento).pathname);
    const contenuto = await readFile(path.join(dist, nome), 'utf8');
    urlTrovate.push(...estraiLoc(contenuto));
  }
  return urlTrovate;
}

function aPercorso(url) {
  try {
    const parsed = new URL(url);
    const percorso = parsed.pathname.replace(/\/$/, '');
    return percorso === '' ? '/' : percorso;
  } catch {
    return url;
  }
}

async function verifica(percorso, attesoStato = 200) {
  const indirizzo = `${base}${percorso}`;
  try {
    const risposta = await fetch(indirizzo, { redirect: 'manual' });
    return {
      percorso,
      stato: risposta.status,
      ok: risposta.status === attesoStato,
      corpo: await risposta.text(),
    };
  } catch (errore) {
    return { percorso, stato: 0, ok: false, corpo: '', errore: String(errore) };
  }
}

function stampaTabella(righe) {
  const larghezza = Math.max(...righe.map((r) => r.percorso.length), 4);
  console.log(`${'URL'.padEnd(larghezza)}  STATO  ESITO`);
  console.log(`${'-'.repeat(larghezza)}  -----  -----`);
  for (const riga of righe) {
    const stato = String(riga.stato).padStart(5);
    console.log(`${riga.percorso.padEnd(larghezza)}  ${stato}  ${riga.ok ? 'OK' : 'KO'}`);
  }
}

/** Elenca ricorsivamente i file con una data estensione dentro una cartella. */
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

/**
 * Raccoglie gli URL assoluti verso il dominio di produzione scritti nell'HTML.
 * Sono i riferimenti che linkinator non può risolvere in locale: canonical,
 * og:image, JSON-LD. Qui vengono ricondotti al server di anteprima e provati.
 */
async function urlAssolutiInterni(dominio) {
  const file = await elencaFile(dist, '.html');
  const trovati = new Set();
  const espressione = new RegExp(`${dominio.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"'\\s<>]*`, 'g');

  for (const percorso of file) {
    const html = await readFile(percorso, 'utf8');
    for (const riferimento of html.match(espressione) ?? []) {
      trovati.add(aPercorso(riferimento));
    }
  }
  return [...trovati].sort();
}

const daSitemap = (await leggiSitemap()).map(aPercorso);
const percorsi = [...new Set([...daSitemap, ...PAGINE_EXTRA])].sort();

console.log(`Server di anteprima: ${base}`);
console.log(`URL dichiarate in sitemap: ${daSitemap.length}`);
console.log(`Pagine noindex aggiunte: ${PAGINE_EXTRA.length}\n`);

const risultati = [];
for (const percorso of percorsi) {
  risultati.push(await verifica(percorso));
}

stampaTabella(risultati);

// Riferimenti assoluti al dominio di produzione, ricondotti all'anteprima.
const dominio = daSitemap.length > 0 ? new URL((await leggiSitemap())[0]).origin : '';
const assoluti = dominio ? await urlAssolutiInterni(dominio) : [];
const risultatiAssoluti = [];
for (const percorso of assoluti) {
  if (percorsi.includes(percorso)) continue;
  risultatiAssoluti.push(await verifica(percorso));
}

if (risultatiAssoluti.length > 0) {
  console.log('\nRiferimenti assoluti al dominio di produzione (canonical, og:image, JSON-LD)');
  stampaTabella(risultatiAssoluti);
}

const errore404 = await verifica(URL_INESISTENTE, 404);
const contiene404 = errore404.corpo.includes(FIRMA_404);

console.log('\nPagina 404 personalizzata');
console.log(`  ${URL_INESISTENTE} -> stato ${errore404.stato} (atteso 404): ${errore404.ok ? 'OK' : 'KO'}`);
console.log(`  contiene il testo della 404 del sito: ${contiene404 ? 'OK' : 'KO'}`);

const falliti = [...risultati, ...risultatiAssoluti].filter((r) => !r.ok);
const tutteOk = falliti.length === 0 && errore404.ok && contiene404;

const totali = risultati.length + risultatiAssoluti.length;
console.log(
  `\nRisultato: ${totali - falliti.length}/${totali} risorse a 200, 404 personalizzata ${errore404.ok && contiene404 ? 'servita' : 'NON servita'}.`
);

if (!tutteOk) {
  for (const riga of falliti) {
    console.error(`FALLITA ${riga.percorso}: stato ${riga.stato}${riga.errore ? ` (${riga.errore})` : ''}`);
  }
  process.exit(1);
}

console.log('Tutte le verifiche sono passate.');
