#!/usr/bin/env node
/**
 * Verifica che nessuna stringa di interfaccia sia scritta a mano nei
 * componenti e nei layout: tutte devono passare da `src/i18n/it.json`
 * tramite l'helper `t()`.
 *
 * Che cosa controlla, per ogni file .astro di `src/components` e
 * `src/layouts` (esclusi frontmatter, <style> e <script>):
 *   1. i nodi di testo del template che non sono espressioni `{...}`;
 *   2. gli attributi visibili all'utente (alt, aria-label, placeholder,
 *      title, aria-description) con valore letterale fra virgolette.
 *
 * Esce con codice 1 se trova qualcosa. Uso: node scripts/check-i18n.mjs [cartelle…]
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Cartelle da esaminare. Di norma componenti e layout; si possono passare
// altre cartelle come argomenti, per esempio `node scripts/check-i18n.mjs src/pages`.
const CARTELLE = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['src/components', 'src/layouts'];

/** Attributi il cui valore viene letto o annunciato all'utente. */
const ATTRIBUTI_VISIBILI = ['alt', 'aria-label', 'aria-description', 'placeholder', 'title'];

/** Testi ammessi: solo cifre, punteggiatura, simboli ed entità HTML. */
const AMMESSI = /^[\s\d\p{P}\p{S}]*$/u;

/** Le entità (&copy;, &middot;, …) non sono testo da tradurre. */
function senzaEntita(testo) {
  return testo.replace(/&(?:[a-zA-Z]+|#\d+);/g, '·');
}

async function elencaAstro(cartella) {
  const voci = await readdir(cartella, { withFileTypes: true });
  const file = [];
  for (const voce of voci) {
    const completo = path.join(cartella, voce.name);
    if (voce.isDirectory()) file.push(...(await elencaAstro(completo)));
    else if (voce.name.endsWith('.astro')) file.push(completo);
  }
  return file;
}

/**
 * Rimuove le espressioni `{...}` bilanciate: quello che resta è markup e
 * testo scritti a mano. Senza questo passaggio il codice JavaScript dentro
 * le espressioni verrebbe scambiato per testo.
 */
function rimuoviEspressioni(sorgente) {
  let risultato = '';
  let profondita = 0;
  let delimitatore = null;

  for (let i = 0; i < sorgente.length; i += 1) {
    const carattere = sorgente[i];

    if (delimitatore) {
      if (carattere === '\\') {
        i += 1;
      } else if (carattere === delimitatore) {
        delimitatore = null;
      }
      if (profondita === 0) risultato += carattere;
      continue;
    }

    if (profondita > 0 && (carattere === "'" || carattere === '"' || carattere === '`')) {
      delimitatore = carattere;
      continue;
    }

    if (carattere === '{') {
      profondita += 1;
      if (profondita === 1) risultato += ' ';
      continue;
    }

    if (carattere === '}') {
      if (profondita > 0) profondita -= 1;
      continue;
    }

    if (profondita === 0) risultato += carattere;
  }

  return risultato;
}

function soloTemplate(sorgente) {
  let corpo = sorgente;
  if (corpo.startsWith('---')) {
    const fine = corpo.indexOf('\n---', 3);
    corpo = fine === -1 ? '' : corpo.slice(fine + 4);
  }
  corpo = corpo
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '');
  return rimuoviEspressioni(corpo);
}

function nodiDiTesto(template) {
  const trovati = [];
  // Testo fra la fine di un tag e l'inizio del successivo.
  for (const corrispondenza of template.matchAll(/>([^<>]+)</g)) {
    const testo = (corrispondenza[1] ?? '').trim();
    if (testo === '' || AMMESSI.test(senzaEntita(testo))) continue;
    trovati.push(testo);
  }
  return trovati;
}

function attributiLetterali(template) {
  const trovati = [];
  for (const attributo of ATTRIBUTI_VISIBILI) {
    const espressione = new RegExp(`\\s${attributo}="([^"{}]+)"`, 'g');
    for (const corrispondenza of template.matchAll(espressione)) {
      const valore = (corrispondenza[1] ?? '').trim();
      if (valore === '' || AMMESSI.test(senzaEntita(valore))) continue;
      trovati.push(`${attributo}="${valore}"`);
    }
  }
  return trovati;
}

let problemi = 0;
let esaminati = 0;

for (const cartella of CARTELLE) {
  for (const file of await elencaAstro(path.join(radice, cartella))) {
    esaminati += 1;
    const template = soloTemplate(await readFile(file, 'utf8'));
    const relativo = path.relative(radice, file);

    for (const testo of nodiDiTesto(template)) {
      console.error(`${relativo}: testo scritto a mano nel template → «${testo}»`);
      problemi += 1;
    }
    for (const attributo of attributiLetterali(template)) {
      console.error(`${relativo}: attributo visibile scritto a mano → ${attributo}`);
      problemi += 1;
    }
  }
}

console.log(`File .astro esaminati in ${CARTELLE.join(' e ')}: ${esaminati}`);

if (problemi > 0) {
  console.error(`\n${problemi} stringhe di interfaccia non passano da src/i18n/it.json.`);
  process.exit(1);
}

console.log('Nessuna stringa di interfaccia scritta a mano: tutte passano da src/i18n/it.json.');
