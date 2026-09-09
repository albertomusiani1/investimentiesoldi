#!/usr/bin/env node
/**
 * Genera le due immagini raster che i social e i sistemi operativi mobili
 * non sanno leggere in SVG:
 *   - public/og-default.png       1200×630, anteprima Open Graph / Twitter
 *   - public/apple-touch-icon.png 180×180, icona per la schermata iOS
 *
 * Entrambe partono dal marchio vero, quello prodotto da `npm run logo`: qui
 * non si ridisegna niente, si compone. Si esegue una tantum
 * (`npm run immagini:social`) e i file prodotti vengono committati.
 * Usa `sharp`, già presente perché è una dipendenza di Astro.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ANTRACITE = '#303435';
const ANTRACITE_SCURO = '#23282a';
const BLU = '#3093c9';
const CHIARO = '#ffffff';
const TENUE = '#c3c9ca';
const GRIGLIA = '#3c4446';

/** Estrae viewBox e tracciato dal marchio monocromatico. */
async function marchio() {
  const svg = await readFile(path.join(radice, 'public', 'img', 'logo-projectune.svg'), 'utf8');
  const vista = svg.match(/viewBox="([^"]+)"/)?.[1];
  const d = svg.match(/<path d="([^"]+)"/)?.[1];
  if (!vista || !d) throw new Error('Marchio non riconosciuto: rilanciare `npm run logo`.');
  const [x, y, larghezza, altezza] = vista.split(' ').map(Number);
  return { x: x, y: y, larghezza: larghezza, altezza: altezza, d };
}

const segno = await marchio();

/** Il marchio scalato a una certa larghezza e posizionato in (x, y). */
function marchioA(x, y, larghezza, colore) {
  const scala = larghezza / segno.larghezza;
  return (
    `<g transform="translate(${x} ${y}) scale(${scala.toFixed(4)}) ` +
    `translate(${-segno.x} ${-segno.y})" fill="${colore}">` +
    `<path d="${segno.d}"/></g>`
  );
}

const altezzaMarchio = (larghezza) => (larghezza * segno.altezza) / segno.larghezza;

const LARGHEZZA_MARCHIO = 470;
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${ANTRACITE}"/>
  <g stroke="${GRIGLIA}" stroke-width="1">
    <path d="M0 90H1200M0 180H1200M0 270H1200M0 360H1200M0 450H1200M0 540H1200"/>
    <path d="M100 0V630M200 0V630M300 0V630M400 0V630M500 0V630M600 0V630M700 0V630M800 0V630M900 0V630M1000 0V630M1100 0V630"/>
  </g>
  <rect x="0" y="0" width="1200" height="630" fill="${ANTRACITE_SCURO}" opacity="0.35"/>
  <rect x="0" y="0" width="1200" height="10" fill="${BLU}"/>
  ${marchioA(80, (630 - altezzaMarchio(LARGHEZZA_MARCHIO)) / 2, LARGHEZZA_MARCHIO, BLU)}
  <g font-family="Helvetica, Arial, sans-serif" fill="${CHIARO}">
    <text x="620" y="272" font-size="46" font-weight="bold">Progettazione meccanica,</text>
    <text x="620" y="330" font-size="46" font-weight="bold">montaggi e revisioni</text>
    <text x="620" y="392" font-size="26" fill="${TENUE}">Castel Maggiore (BO)</text>
  </g>
  <rect x="620" y="424" width="180" height="6" fill="${BLU}"/>
</svg>`;

const icona = await readFile(path.join(radice, 'public', 'favicon.svg'), 'utf8');

async function scrivi(nome, svg, larghezza, altezza) {
  const png = await sharp(Buffer.from(svg))
    .resize(larghezza, altezza, { fit: 'fill' })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  const destinazione = path.join(radice, 'public', nome);
  await writeFile(destinazione, png);
  console.log(`${nome}: ${(png.length / 1024).toFixed(1)} kB`);
}

await scrivi('og-default.png', og, 1200, 630);
await scrivi('apple-touch-icon.png', icona, 180, 180);
