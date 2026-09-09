#!/usr/bin/env node
/**
 * Genera il video del hero e le sue immagini di attesa.
 *
 * Che cosa produce, in public/:
 *   video/hero.mp4            8 s, ciclo continuo, H.264
 *   img/hero-poster.jpg       fermo immagine, ricaduta universale
 *   img/hero-poster-900.webp  \
 *   img/hero-poster-1600.webp / le versioni leggere, servite via <picture>
 *
 * Il filmato è **astratto**: un favo che respira dentro tre aloni di luce
 * blu che si spostano lentamente. Non c'è un pezzo meccanico da guardare, e
 * non deve esserci: nel hero il video sta dietro al titolo, sfocato e
 * ombreggiato dal CSS, e il suo compito è dare movimento e colore, non
 * raccontare qualcosa. Un soggetto riconoscibile, sfocato, diventerebbe
 * soltanto una macchia che distrae.
 *
 * Per questo le forme sono grandi e i movimenti lenti: dopo una sfocatura di
 * 14 px un reticolo fine sparisce, un alone di trecento pixel no.
 *
 * Tutto è calcolato qui: nessun filmato scaricato, nessuna libreria grafica.
 * Ogni movimento è funzione di sin/cos di 2π·t, quindi l'ultimo fotogramma
 * combacia col primo e il ciclo non ha stacco.
 *
 * SERVE FFMPEG. Non è una dipendenza del progetto: si esegue una tantum e i
 * file prodotti vengono committati. Se `ffmpeg` non è nel PATH, indicalo con
 * la variabile FFMPEG:
 *
 *   npm run video
 *   FFMPEG=/percorso/di/ffmpeg npm run video
 *
 * SOSTITUIRE PRIMA DI ANDARE ONLINE: se il cliente fornisce riprese vere
 * dello stabilimento, basta mettere il suo montaggio in public/video/hero.mp4
 * (H.264, muto, ciclabile, sotto il mezzo megabyte) e un fermo immagine in
 * public/img/hero-poster.jpg. Questo script non serve più.
 */
import { mkdir, writeFile, rm, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const esegui = promisify(execFile);

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cartellaVideo = path.join(radice, 'public', 'video');
const cartellaImmagini = path.join(radice, 'public', 'img');
const lavoro = path.join(radice, 'public', '.frame-temporanei');
const binarioFfmpeg = process.env['FFMPEG'] ?? 'ffmpeg';

const L = 1600;
const H = 900;
const FRAME = 200;
const FPS = 25;

// Palette: i due colori del marchio e le loro varianti chiare.
const FONDO_ALTO = '#0a1013';
const FONDO_BASSO = '#111c21';
const BLU = '#3093c9';
const BLU_CHIARO = '#6cc3ee';
const BLU_SCURO = '#1b6e9b';

const n = (v) => Math.round(v * 10) / 10;
const TAU = Math.PI * 2;

/**
 * Tre aloni di luce. Ognuno percorre una curva chiusa (Lissajous con
 * frequenze intere), quindi torna esattamente al punto di partenza alla fine
 * del ciclo. Sono la sorgente di luce del filmato: tutto il resto la riflette.
 */
const ALONI = [
  { colore: BLU, x: 0.68, y: 0.34, ax: 0.13, ay: 0.09, fx: 1, fy: 2, fase: 0.0, r: 0.52, op: 0.5 },
  { colore: BLU_SCURO, x: 0.24, y: 0.68, ax: 0.1, ay: 0.12, fx: 2, fy: 1, fase: 0.35, r: 0.46, op: 0.42 },
  { colore: BLU_CHIARO, x: 0.86, y: 0.74, ax: 0.08, ay: 0.07, fx: 1, fy: 1, fase: 0.7, r: 0.3, op: 0.26 },
];

/** Un esagono con la punta in alto, centrato in (cx, cy). */
function esagono(cx, cy, lato) {
  const punti = [];
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 180) * (60 * i - 90);
    punti.push(`${n(cx + lato * Math.cos(a))} ${n(cy + lato * Math.sin(a))}`);
  }
  return `M${punti.join('L')}Z`;
}

/**
 * Il reticolo del favo, calcolato una volta sola: posizione di ogni maglia e
 * la sua fase nell'onda, che dipende da dove si trova. È così che l'onda
 * attraversa lo schermo invece di far lampeggiare tutto insieme.
 */
const LATO = 74;
const maglie = [];
{
  const passoX = Math.sqrt(3) * LATO;
  const passoY = 1.5 * LATO;
  for (let riga = -1; riga * passoY < H + LATO; riga += 1) {
    for (let colonna = -1; colonna * passoX < L + passoX; colonna += 1) {
      const cx = colonna * passoX + (Math.abs(riga % 2) === 1 ? passoX / 2 : 0);
      const cy = riga * passoY;
      // La fase segue una diagonale: l'onda entra da sinistra in alto.
      const fase = (cx / L) * 0.75 + (cy / H) * 0.35;
      maglie.push({ cx, cy, fase, tracciato: esagono(cx, cy, LATO * 0.93) });
    }
  }
}

/** Le maglie che ogni tanto si riempiono: una su sette, sempre le stesse. */
const PIENE = new Set(maglie.map((_, i) => i).filter((i) => i % 7 === 3));

function fotogramma(indice) {
  const t = indice / FRAME;

  const aloni = ALONI.map((a, i) => {
    const cx = (a.x + a.ax * Math.cos(TAU * (t * a.fx + a.fase))) * L;
    const cy = (a.y + a.ay * Math.sin(TAU * (t * a.fy + a.fase))) * H;
    const raggio = a.r * L * (1 + 0.06 * Math.sin(TAU * (t + a.fase)));
    return `
    <radialGradient id="alone${i}" gradientUnits="userSpaceOnUse"
      cx="${n(cx)}" cy="${n(cy)}" r="${n(raggio)}">
      <stop offset="0" stop-color="${a.colore}" stop-opacity="${a.op}"/>
      <stop offset="0.55" stop-color="${a.colore}" stop-opacity="${n(a.op * 0.28)}"/>
      <stop offset="1" stop-color="${a.colore}" stop-opacity="0"/>
    </radialGradient>`;
  }).join('');

  const rettangoliAloni = ALONI.map(
    (_, i) => `<rect width="${L}" height="${H}" fill="url(#alone${i})"/>`
  ).join('');

  // Il favo: ogni maglia ha la sua opacità, che oscilla con la fase del
  // punto in cui si trova. Le maglie con la stessa fase si accendono
  // insieme: quello che si vede è un'onda che attraversa il campo.
  const contorni = [];
  const piene = [];
  maglie.forEach((maglia, i) => {
    const onda = Math.sin(TAU * (t - maglia.fase));
    const opacita = 0.05 + 0.13 * (onda * 0.5 + 0.5);
    contorni.push(
      `<path d="${maglia.tracciato}" fill="none" stroke="${BLU_CHIARO}" ` +
        `stroke-width="1.3" opacity="${n(opacita)}"/>`
    );
    if (PIENE.has(i)) {
      const pieno = 0.015 + 0.05 * Math.max(0, onda);
      piene.push(`<path d="${maglia.tracciato}" fill="${BLU}" opacity="${n(pieno)}"/>`);
    }
  });

  // Due lame di luce che scivolano in diagonale: rompono la regolarità del
  // favo e, sfocate, diventano il riflesso su una lastra.
  // Sono sfumature, non poligoni: un poligono lascerebbe due spigoli netti
  // che, dopo la sfocatura del CSS, si vedono come una piega nel fondo.
  const definizioniLame = [0, 1]
    .map((k) => {
      const avanzamento = (t + k * 0.5) % 1;
      const x = -500 + avanzamento * (L + 1000);
      const intensita = n(0.05 + 0.035 * Math.sin(TAU * avanzamento));
      return `
    <linearGradient id="lama${k}" gradientUnits="userSpaceOnUse"
      x1="${n(x - 300)}" y1="-100" x2="${n(x + 300)}" y2="${H + 100}">
      <stop offset="0" stop-color="${BLU_CHIARO}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${BLU_CHIARO}" stop-opacity="${intensita}"/>
      <stop offset="1" stop-color="${BLU_CHIARO}" stop-opacity="0"/>
    </linearGradient>`;
    })
    .join('');

  const lame = [0, 1]
    .map((k) => `<rect width="${L}" height="${H}" fill="url(#lama${k})"/>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}">
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${FONDO_ALTO}"/>
      <stop offset="1" stop-color="${FONDO_BASSO}"/>
    </linearGradient>${aloni}
    <radialGradient id="vignetta" cx="0.5" cy="0.45" r="0.78">
      <stop offset="0.4" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.62"/>
    </radialGradient>${definizioniLame}
  </defs>
  <rect width="${L}" height="${H}" fill="url(#fondo)"/>
  ${rettangoliAloni}
  ${piene.join('')}
  ${contorni.join('')}
  ${lame}
  <rect width="${L}" height="${H}" fill="url(#vignetta)"/>
</svg>`;
}

// --- resa dei fotogrammi -----------------------------------------------------
await rm(lavoro, { recursive: true, force: true });
await mkdir(lavoro, { recursive: true });
await mkdir(cartellaVideo, { recursive: true });
await mkdir(cartellaImmagini, { recursive: true });

for (let i = 0; i < FRAME; i += 1) {
  const png = await sharp(Buffer.from(fotogramma(i))).png({ compressionLevel: 1 }).toBuffer();
  await writeFile(path.join(lavoro, `f-${String(i).padStart(4, '0')}.png`), png);
  if (i % 40 === 0) console.log(`fotogramma ${i}/${FRAME}`);
}
console.log('fotogrammi resi');

// --- fermo immagine ----------------------------------------------------------
// È l'elemento più grande della pagina e quindi quello che decide la velocità
// percepita: va servito il più leggero possibile. Il WebP costa metà del JPEG
// su un'immagine così piatta; il JPEG resta come ricaduta.
const posterSvg = fotogramma(0);
const poster = await sharp(Buffer.from(posterSvg)).png().toBuffer();

await sharp(poster)
  .jpeg({ quality: 72, progressive: true, mozjpeg: true })
  .toFile(path.join(cartellaImmagini, 'hero-poster.jpg'));

for (const larghezza of [900, 1600]) {
  await sharp(poster)
    .resize(larghezza)
    .webp({ quality: 70, effort: 6 })
    .toFile(path.join(cartellaImmagini, `hero-poster-${larghezza}.webp`));
}

// --- codifica ----------------------------------------------------------------
const ingresso = path.join(lavoro, 'f-%04d.png');

await esegui(binarioFfmpeg, [
  '-y',
  '-framerate', String(FPS),
  '-i', ingresso,
  '-c:v', 'libx264',
  '-profile:v', 'high',
  '-pix_fmt', 'yuv420p',
  '-crf', '30',
  '-preset', 'veryslow',
  '-movflags', '+faststart',
  '-an',
  path.join(cartellaVideo, 'hero.mp4'),
]);

await rm(lavoro, { recursive: true, force: true });

const peso = async (percorso) => ((await stat(percorso)).size / 1024).toFixed(0);
console.log(`hero.mp4              ${await peso(path.join(cartellaVideo, 'hero.mp4'))} kB`);
console.log(`hero-poster.jpg       ${await peso(path.join(cartellaImmagini, 'hero-poster.jpg'))} kB`);
console.log(`hero-poster-900.webp  ${await peso(path.join(cartellaImmagini, 'hero-poster-900.webp'))} kB`);
console.log(`hero-poster-1600.webp ${await peso(path.join(cartellaImmagini, 'hero-poster-1600.webp'))} kB`);
