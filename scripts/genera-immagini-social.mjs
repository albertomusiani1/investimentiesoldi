#!/usr/bin/env node
/**
 * Genera le due immagini raster che i social e i sistemi operativi mobili
 * non sanno leggere in SVG:
 *   - public/og-default.png       1200×630, anteprima Open Graph / Twitter
 *   - public/apple-touch-icon.png 180×180, icona per la schermata iOS
 *
 * Si esegue una tantum (`node scripts/genera-immagini-social.mjs`) e i file
 * prodotti vengono committati. Usa `sharp`, già presente perché è una
 * dipendenza di Astro: non aggiunge nulla al progetto.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PRIMARIO = '#1d3648';
const ACCENTO = '#8f3d18';
const CHIARO = '#faf8f5';
const TENUE = '#c9d4dd';

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PRIMARIO}"/>
  <g stroke="#2b4f68" stroke-width="1">
    <path d="M0 90H1200M0 180H1200M0 270H1200M0 360H1200M0 450H1200M0 540H1200"/>
    <path d="M100 0V630M200 0V630M300 0V630M400 0V630M500 0V630M600 0V630M700 0V630M800 0V630M900 0V630M1000 0V630M1100 0V630"/>
  </g>
  <g>
    <rect x="80" y="360" width="34" height="70" fill="${CHIARO}"/>
    <rect x="128" y="316" width="34" height="114" fill="${CHIARO}"/>
    <rect x="176" y="258" width="34" height="172" fill="${ACCENTO}"/>
  </g>
  <text x="80" y="200" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="bold" fill="${CHIARO}">Brambilla Future</text>
  <text x="80" y="256" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="${TENUE}">Ingegneria e componentistica per l'automotive</text>
  <circle cx="980" cy="315" r="150" fill="none" stroke="${TENUE}" stroke-width="6"/>
  <circle cx="980" cy="315" r="92" fill="none" stroke="${TENUE}" stroke-width="4"/>
  <circle cx="980" cy="315" r="40" fill="${ACCENTO}"/>
  <rect x="80" y="500" width="220" height="6" fill="${ACCENTO}"/>
</svg>`;

const icona = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="${PRIMARIO}"/>
  <rect x="6" y="18" width="5" height="8" fill="${CHIARO}"/>
  <rect x="13" y="12" width="5" height="14" fill="${CHIARO}"/>
  <rect x="20" y="6" width="5" height="20" fill="${ACCENTO}"/>
</svg>`;

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
