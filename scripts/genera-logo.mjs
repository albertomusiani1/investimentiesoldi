#!/usr/bin/env node
/**
 * Ricava i file SVG del marchio dal PDF originale fornito dal cliente.
 *
 * Il PDF (`brand/logo-projectune.pdf`) è l'originale vettoriale: qui non si
 * ridisegna niente a mano, si converte. Così se il cliente manda una versione
 * aggiornata del marchio basta sostituire il PDF e rilanciare `npm run logo`.
 *
 * Il PDF esce da Inkscape via cairo: una sola pagina, un solo flusso di
 * contenuto compresso, testo già convertito in tracciati, nessuna immagine.
 * Servono quindi solo gli operatori di percorso (m l c h re), il riempimento
 * (f) e il colore (rg): un convertitore completo non serve e sarebbe peggio,
 * perché nasconderebbe eventuali sorprese nel file.
 *
 * Produce:
 *   src/marchio/logo-projectune-testo.svg  solo la scritta, per l'intestazione
 *   public/img/logo-projectune.svg         marchio completo, per il piè di pagina
 *   public/favicon.svg                     esagono e ingranaggio su antracite
 *
 * La scritta sta in `src/` perché viene incorporata nella pagina (`?raw`):
 * è in cima a ogni pagina, e un file esterno comparirebbe con un istante di
 * ritardo. Il marchio completo, che sta in fondo, è un file vero: pesa 14 kB
 * e incorporarlo vorrebbe dire ripeterlo in tutte e sedici le pagine, mentre
 * così il browser lo scarica una volta sola e se lo tiene.
 *
 * Uso: node scripts/genera-logo.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sorgente = path.join(radice, 'brand', 'logo-projectune.pdf');

/** I due colori del marchio, come stanno nel PDF. */
export const ANTRACITE = '#303435';
export const BLU = '#3093C9';

/** Estrae e decomprime l'unico flusso di contenuto della pagina. */
function flussoContenuto(pdf) {
  const inizio = pdf.indexOf('stream', pdf.indexOf('4 0 obj'));
  if (inizio === -1) throw new Error('PDF inatteso: manca il flusso di contenuto (oggetto 4).');
  let dati = inizio + 'stream'.length;
  if (pdf[dati] === 0x0d) dati += 1;
  if (pdf[dati] === 0x0a) dati += 1;
  const fine = pdf.indexOf('endstream', dati);
  return inflateSync(pdf.subarray(dati, fine)).toString('latin1');
}

const arrotonda = (valore) => Number.parseFloat(Number(valore).toFixed(2));

/**
 * Traduce il flusso di contenuto in un elenco di tracciati {colore, d}.
 *
 * Le coordinate non vanno trasformate: il PDF apre con `1 0 0 -1 0 375 cm`,
 * che ribalta l'asse Y, e da lì in poi i numeri sono già nell'orientamento
 * di SVG (Y verso il basso).
 */
function tracciati(contenuto) {
  const pezzi = contenuto.replace(/\s+/g, ' ').split(' ');
  const risultato = [];
  let numeri = [];
  let colore = null;
  let d = '';

  const ultimi = (quanti) => numeri.slice(-quanti).map(arrotonda);

  for (const pezzo of pezzi) {
    if (/^-?\d*\.?\d+$/.test(pezzo)) {
      numeri.push(Number(pezzo));
      continue;
    }
    switch (pezzo) {
      case 'rg': {
        const [r, g, b] = numeri.slice(-3);
        const canale = (v) => Math.round(v * 255).toString(16).toUpperCase().padStart(2, '0');
        colore = `#${canale(r)}${canale(g)}${canale(b)}`;
        break;
      }
      case 'm':
        d += `M${ultimi(2).join(' ')}`;
        break;
      case 'l':
        d += `L${ultimi(2).join(' ')}`;
        break;
      case 'c':
        d += `C${ultimi(6).join(' ')}`;
        break;
      case 'h':
        d += 'Z';
        break;
      case 're': {
        const [x, y, larghezza, altezza] = ultimi(4);
        d += `M${x} ${y}H${arrotonda(x + larghezza)}V${arrotonda(y + altezza)}H${x}Z`;
        break;
      }
      case 'f':
      case 'f*':
        if (d !== '') risultato.push({ colore, d });
        d = '';
        break;
      default:
        break;
    }
    numeri = [];
  }
  return risultato;
}

/** Rettangolo che contiene i tracciati indicati (i punti di controllo bastano). */
function riquadro(elenco) {
  const numeri = elenco.flatMap((p) => [...p.d.matchAll(/-?\d*\.?\d+/g)].map((m) => Number(m[0])));
  const x = numeri.filter((_, i) => i % 2 === 0);
  const y = numeri.filter((_, i) => i % 2 === 1);
  return { x0: Math.min(...x), y0: Math.min(...y), x1: Math.max(...x), y1: Math.max(...y) };
}

function vistaCon(elenco, margine) {
  const r = riquadro(elenco);
  const x = arrotonda(r.x0 - margine);
  const y = arrotonda(r.y0 - margine);
  return `${x} ${y} ${arrotonda(r.x1 - r.x0 + margine * 2)} ${arrotonda(r.y1 - r.y0 + margine * 2)}`;
}

const pdf = await readFile(sorgente);
const tutti = tracciati(flussoContenuto(pdf));
const marchio = tutti.filter((p) => p.colore === BLU);

if (marchio.length !== 17) {
  throw new Error(
    `Il PDF contiene ${marchio.length} tracciati blu invece dei 17 attesi: ` +
      'il marchio è cambiato, va rivista la suddivisione in esagono, scritta e icone.'
  );
}

// L'ordine dei tracciati nel PDF è stabile: due semi-esagoni, le dieci
// lettere, l'icona in alto (tre pezzi), il monitor in basso (due pezzi).
const esagono = marchio.slice(0, 2);
const scritta = marchio.slice(2, 12);
const ingranaggio = marchio.slice(12, 15);

const unisci = (elenco) => elenco.map((p) => p.d).join('');

// I due marchi incorporati sono decorativi: il nome dell'azienda è già
// scritto in chiaro accanto a loro, quindi restano fuori dall'albero di
// accessibilità invece di essere letti due volte.
const intestazione = (vista) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vista}" fill="currentColor" ` +
  'aria-hidden="true" focusable="false">';

// Il marchio completo è servito come file: il colore ce l'ha dentro.
const completo =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vistaCon(marchio, 4)}" ` +
  `fill="${BLU}"><path d="${unisci(marchio)}"/></svg>\n`;
const soloTesto = `${intestazione(vistaCon(scritta, 2))}<path d="${unisci(scritta)}"/></svg>\n`;

// Favicon: quadrato antracite, esagono e ingranaggio blu.
//
// A 16 px la scritta sparirebbe e l'ingranaggio, che nel marchio sta nella
// fascia alta, diventerebbe un puntino: qui viene portato al centro
// dell'esagono e ingrandito, nello spazio che nel marchio occupa la scritta.
// È l'unico adattamento del disegno originale, e vale solo per l'icona.
const centro = (r) => [(r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2];
const rEsagono = riquadro(esagono);
const rIngranaggio = riquadro(ingranaggio);
const [exc, eyc] = centro(rEsagono);
const [ixc, iyc] = centro(rIngranaggio);

const INGRANDIMENTO = 2.2;
const ingranaggioCentrato =
  `<g transform="translate(${arrotonda(exc - ixc * INGRANDIMENTO)} ` +
  `${arrotonda(eyc - iyc * INGRANDIMENTO)}) scale(${INGRANDIMENTO})">` +
  `<path d="${unisci(ingranaggio)}"/></g>`;

const lato = Math.max(rEsagono.x1 - rEsagono.x0, rEsagono.y1 - rEsagono.y0);
const scala = arrotonda(186 / lato);
const dx = arrotonda(128 - exc * scala);
const dy = arrotonda(128 - eyc * scala);
const favicon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">' +
  `<rect width="256" height="256" rx="34" fill="${ANTRACITE}"/>` +
  `<g transform="translate(${dx} ${dy}) scale(${scala})" fill="${BLU}">` +
  `<path d="${unisci(esagono)}"/>${ingranaggioCentrato}</g></svg>\n`;

const uscite = [
  ['src/marchio/logo-projectune-testo.svg', soloTesto],
  ['public/img/logo-projectune.svg', completo],
  ['public/favicon.svg', favicon],
];

for (const [relativo, contenuto] of uscite) {
  await writeFile(path.join(radice, relativo), contenuto, 'utf8');
  console.log(`${relativo} — ${(contenuto.length / 1024).toFixed(1)} kB`);
}
