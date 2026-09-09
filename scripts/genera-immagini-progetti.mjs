#!/usr/bin/env node
/**
 * Genera le sei illustrazioni delle schede lavoro, in `public/img/progetti/`.
 *
 * Non sono fotografie e non fingono di esserlo: sono schemi geometrici nella
 * palette del marchio, pensati per reggere finché non arrivano le foto vere
 * dei lavori. Sostituendo un'immagine basta tenere le stesse proporzioni
 * (800 × 500) e aggiornare `immagineAlt` nel file .md del lavoro.
 *
 * Uso: node scripts/genera-immagini-progetti.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destinazione = path.join(radice, 'public', 'img', 'progetti');

const FONDO = '#e7ebeb';
const INCHIOSTRO = '#303435';
const BLU = '#3093c9';
const TENUE = '#aab3b4';

/** Filigrana comune: mezzo esagono del marchio, in basso a destra. */
const filigrana = `
  <g stroke="${TENUE}" stroke-width="6" fill="none" opacity="0.5">
    <path d="M604 470V430l76-42 76 42v40"/>
  </g>`;

const cornice = `
  <rect width="800" height="500" fill="${FONDO}"/>
  <g stroke="${TENUE}" stroke-width="1" opacity="0.65">
    <path d="M0 100H800M0 200H800M0 300H800M0 400H800"/>
    <path d="M100 0V500M200 0V500M300 0V500M400 0V500M500 0V500M600 0V500M700 0V500"/>
  </g>`;

const disegni = {
  // Gruppo di dosaggio: cilindro, pistone, asse di simmetria.
  'gruppo-dosaggio-farmaceutico': `
    <g fill="none" stroke="${INCHIOSTRO}" stroke-width="8">
      <rect x="300" y="120" width="200" height="260" rx="10"/>
      <path d="M340 120V70h120v50"/>
    </g>
    <rect x="330" y="210" width="140" height="46" fill="${BLU}"/>
    <rect x="384" y="96" width="32" height="118" fill="${FONDO}" stroke="${INCHIOSTRO}" stroke-width="8"/>
    <g stroke="${INCHIOSTRO}" stroke-width="3" stroke-dasharray="16 10 4 10">
      <path d="M400 40v420"/>
    </g>
    <g fill="none" stroke="${BLU}" stroke-width="6" stroke-linecap="round">
      <path d="M540 300h90M600 270l30 30-30 30"/>
    </g>
    <g fill="none" stroke="${INCHIOSTRO}" stroke-width="4">
      <path d="M300 420h200M300 410v20M500 410v20"/>
    </g>`,

  // Trasmissione a cinghia: due pulegge dentate e il nastro.
  'montaggio-gruppi-packaging': `
    <g fill="none" stroke="${INCHIOSTRO}" stroke-width="8">
      <path d="M250 150h300a100 100 0 0 1 0 200H250a100 100 0 0 1 0-200z"/>
      <circle cx="250" cy="250" r="66"/>
      <circle cx="550" cy="250" r="66"/>
    </g>
    <circle cx="250" cy="250" r="24" fill="${BLU}"/>
    <circle cx="550" cy="250" r="24" fill="${BLU}"/>
    <g stroke="${INCHIOSTRO}" stroke-width="6" stroke-linecap="round">
      <path d="M250 160v-24M250 340v24M162 250h-24M338 250h24M550 160v-24M550 340v24M638 250h24"/>
    </g>
    <g fill="none" stroke="${BLU}" stroke-width="6" stroke-linecap="round">
      <path d="M330 96h140M446 78l24 18-24 18"/>
    </g>`,

  // Pompa per vuoto: corpo, bocchello, manometro.
  'revisione-pompe-vuoto': `
    <g fill="none" stroke="${INCHIOSTRO}" stroke-width="8">
      <rect x="180" y="200" width="290" height="180" rx="14"/>
      <path d="M470 260h80v60h-80"/>
      <circle cx="300" cy="290" r="58"/>
      <path d="M180 380v40h290v-40"/>
    </g>
    <circle cx="300" cy="290" r="18" fill="${BLU}"/>
    <g fill="none" stroke="${INCHIOSTRO}" stroke-width="8">
      <circle cx="600" cy="180" r="70"/>
      <path d="M600 180l40-30M550 250l30-24"/>
    </g>
    <path d="M600 110a70 70 0 0 1 62 38l-30 15a36 36 0 0 0-32-19z" fill="${BLU}"/>
    <g stroke="${INCHIOSTRO}" stroke-width="6" stroke-linecap="round">
      <path d="M240 200v-46M360 200v-46"/>
    </g>`,

  // Banco di prova tenuta: recipiente, valvola, strumento.
  'banco-prova-tenuta': `
    <g fill="none" stroke="${INCHIOSTRO}" stroke-width="8">
      <rect x="140" y="150" width="240" height="240" rx="18"/>
      <path d="M380 210h120M500 190v40M500 210h120"/>
      <circle cx="660" cy="210" r="46"/>
      <path d="M380 330h90a40 40 0 0 0 40-40v-20"/>
    </g>
    <path d="M470 190l30 20-30 20z" fill="${BLU}"/>
    <path d="M530 190l-30 20 30 20z" fill="${BLU}"/>
    <circle cx="660" cy="210" r="12" fill="${BLU}"/>
    <g stroke="${BLU}" stroke-width="6" stroke-linecap="round" fill="none">
      <path d="M200 250v80M260 230v100M320 260v70"/>
    </g>
    <g stroke="${INCHIOSTRO}" stroke-width="3" stroke-dasharray="12 8">
      <path d="M140 420h240"/>
    </g>`,

  // Accumulatore oleodinamico: corpo cilindrico, membrana, attacchi.
  'accumulatori-oleodinamici': `
    <g fill="none" stroke="${INCHIOSTRO}" stroke-width="8">
      <path d="M330 130h140a60 60 0 0 1 60 60v160a60 60 0 0 1-60 60H330a60 60 0 0 1-60-60V190a60 60 0 0 1 60-60z"/>
      <path d="M270 260c50-40 210-40 260 0"/>
      <path d="M370 100h60v30h-60zM370 410h60v30h-60z"/>
    </g>
    <path d="M272 258c50-38 206-38 256 0v96c-50 34-206 34-256 0z" fill="${BLU}" opacity="0.22"/>
    <g stroke="${INCHIOSTRO}" stroke-width="6" stroke-linecap="round">
      <path d="M600 190v170M590 200l10-14 10 14M590 350l10 14 10-14"/>
    </g>
    <g fill="none" stroke="${BLU}" stroke-width="6">
      <path d="M180 210h60M180 300h60M180 390h60"/>
    </g>`,

  // Attrezzatura per fonderia: stampo in due parti e colonne di guida.
  'attrezzatura-fonderia': `
    <g fill="none" stroke="${INCHIOSTRO}" stroke-width="8">
      <rect x="230" y="120" width="340" height="120" rx="8"/>
      <rect x="230" y="270" width="340" height="120" rx="8"/>
      <path d="M290 120V90M510 120V90M290 390v30M510 390v30"/>
    </g>
    <path d="M356 176h88v64h-24v30h-40v-30h-24z" fill="${BLU}" opacity="0.9"/>
    <path d="M368 300h64v-30h-64z" fill="${BLU}" opacity="0.35"/>
    <g fill="none" stroke="${INCHIOSTRO}" stroke-width="6">
      <path d="M366 120l14-34h40l14 34"/>
    </g>
    <g fill="none" stroke="${BLU}" stroke-width="6" stroke-linecap="round">
      <path d="M640 200v110M626 290l14 20 14-20"/>
    </g>
    <g stroke="${INCHIOSTRO}" stroke-width="3" stroke-dasharray="12 8">
      <path d="M180 255h440"/>
    </g>`,
};

await mkdir(destinazione, { recursive: true });

for (const [nome, corpo] of Object.entries(disegni)) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" ' +
    `role="img" aria-hidden="true" focusable="false">${cornice}${corpo}${filigrana}</svg>\n`;
  await writeFile(path.join(destinazione, `${nome}.svg`), svg, 'utf8');
  console.log(`${nome}.svg — ${(svg.length / 1024).toFixed(1)} kB`);
}
