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
 * Il filmato è un wireframe di flangia che ruota in proiezione ortografica
 * sopra una griglia da tavolo da disegno: tutto calcolato qui, nessun filmato
 * scaricato e nessuna libreria 3D. Il giro è di 360° esatti sulla durata,
 * così il ciclo non ha stacco.
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

// palette del marchio: antracite e blu PROJECTUNE
const FONDO_ALTO = '#23282a';
const FONDO_BASSO = '#303435';
const GRIGLIA = '#3c4446';
const GRIGLIA_FORTE = '#4b5457';
const LINEA = '#dfe5e6';
const ACCENTO = '#3093c9';

// --- geometria della flangia (mm, poi scalata) ------------------------------
const R_ESTERNO = 250;
const R_FORO = 92;
const R_BULLONI = 182;
const R_BULLONE = 25;
const SPESSORE = 54;
const N_BULLONI = 6;

/** Cerchio sul piano XY a quota z, campionato in `passi` punti. */
function cerchio(raggio, z, passi = 72, cx = 0, cy = 0) {
  return Array.from({ length: passi + 1 }, (_, i) => {
    const a = (i / passi) * Math.PI * 2;
    return [cx + raggio * Math.cos(a), cy + raggio * Math.sin(a), z];
  });
}

const polilinee = [];

// facce anteriore e posteriore
for (const z of [-SPESSORE / 2, SPESSORE / 2]) {
  polilinee.push({ punti: cerchio(R_ESTERNO, z), peso: 2.4, colore: LINEA });
  polilinee.push({ punti: cerchio(R_FORO, z), peso: 2.4, colore: LINEA });
  for (let i = 0; i < N_BULLONI; i += 1) {
    const a = (i / N_BULLONI) * Math.PI * 2;
    polilinee.push({
      punti: cerchio(R_BULLONE, z, 36, R_BULLONI * Math.cos(a), R_BULLONI * Math.sin(a)),
      peso: 1.6,
      colore: i === 0 ? ACCENTO : LINEA,
    });
  }
}

// interasse dei bulloni: tratteggio di riferimento, in accento
polilinee.push({ punti: cerchio(R_BULLONI, 0, 96), peso: 1.4, colore: ACCENTO, tratteggio: '10 12' });

// generatrici che legano le due facce
for (let i = 0; i < 24; i += 1) {
  const a = (i / 24) * Math.PI * 2;
  for (const raggio of [R_ESTERNO, R_FORO]) {
    polilinee.push({
      punti: [
        [raggio * Math.cos(a), raggio * Math.sin(a), -SPESSORE / 2],
        [raggio * Math.cos(a), raggio * Math.sin(a), SPESSORE / 2],
      ],
      peso: 1.1,
      colore: LINEA,
    });
  }
}

// pareti dei fori filettati
for (let i = 0; i < N_BULLONI; i += 1) {
  const a = (i / N_BULLONI) * Math.PI * 2;
  const cx = R_BULLONI * Math.cos(a);
  const cy = R_BULLONI * Math.sin(a);
  for (let k = 0; k < 8; k += 1) {
    const b = (k / 8) * Math.PI * 2;
    polilinee.push({
      punti: [
        [cx + R_BULLONE * Math.cos(b), cy + R_BULLONE * Math.sin(b), -SPESSORE / 2],
        [cx + R_BULLONE * Math.cos(b), cy + R_BULLONE * Math.sin(b), SPESSORE / 2],
      ],
      peso: 0.9,
      colore: i === 0 ? ACCENTO : LINEA,
    });
  }
}

// --- proiezione --------------------------------------------------------------
const INCLINAZIONE = (17 * Math.PI) / 180; // ribaltamento attorno a X
const SCALA = 1.42;
const CX = L * 0.63; // spostato a destra: a sinistra ci va il titolo
const CY = H * 0.4;

function proietta([x, y, z], angolo) {
  // rotazione attorno all'asse verticale del pezzo (Z della geometria)
  const cx = Math.cos(angolo);
  const sx = Math.sin(angolo);
  const x1 = x * cx - y * sx;
  const y1 = x * sx + y * cx;
  const z1 = z;

  // il pezzo sta in piedi: Y del mondo è Z della geometria
  const yMondo = z1;
  const zMondo = y1;

  // ribaltamento attorno a X del mondo
  const ci = Math.cos(INCLINAZIONE);
  const si = Math.sin(INCLINAZIONE);
  const y2 = yMondo * ci - zMondo * si;
  const z2 = yMondo * si + zMondo * ci;

  return [CX + x1 * SCALA, CY - y2 * SCALA, z2];
}

const numero = (valore) => Math.round(valore * 10) / 10;

function griglia() {
  const linee = [];
  for (let x = 0; x <= L; x += 40) {
    linee.push(`M${x} 0V${H}`);
  }
  for (let y = 0; y <= H; y += 40) {
    linee.push(`M0 ${y}H${L}`);
  }
  const forti = [];
  for (let x = 0; x <= L; x += 200) forti.push(`M${x} 0V${H}`);
  for (let y = 0; y <= H; y += 200) forti.push(`M0 ${y}H${L}`);

  return `
    <path d="${linee.join('')}" stroke="${GRIGLIA}" stroke-width="1" fill="none" opacity="0.55"/>
    <path d="${forti.join('')}" stroke="${GRIGLIA_FORTE}" stroke-width="1.4" fill="none" opacity="0.8"/>`;
}

const GRIGLIA_SVG = griglia();

function fotogramma(indice) {
  const angolo = (indice / FRAME) * Math.PI * 2;

  const disegnate = polilinee
    .map((linea) => {
      const proiettati = linea.punti.map((p) => proietta(p, angolo));
      const profonditaMedia =
        proiettati.reduce((somma, p) => somma + p[2], 0) / proiettati.length;
      return { ...linea, proiettati, profonditaMedia };
    })
    .sort((a, b) => a.profonditaMedia - b.profonditaMedia);

  const estremi = disegnate.reduce(
    (acc, l) => [Math.min(acc[0], l.profonditaMedia), Math.max(acc[1], l.profonditaMedia)],
    [Infinity, -Infinity]
  );
  const intervallo = estremi[1] - estremi[0] || 1;

  const tracciati = disegnate
    .map((linea) => {
      const vicinanza = (linea.profonditaMedia - estremi[0]) / intervallo;
      const opacita = numero(0.22 + vicinanza * 0.78);
      const d = linea.proiettati
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${numero(p[0])} ${numero(p[1])}`)
        .join('');
      return `<path d="${d}" stroke="${linea.colore}" stroke-width="${numero(
        linea.peso * (0.75 + vicinanza * 0.45)
      )}" fill="none" opacity="${opacita}"${
        linea.tratteggio ? ` stroke-dasharray="${linea.tratteggio}"` : ''
      } stroke-linecap="round"/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}">
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${FONDO_ALTO}"/>
      <stop offset="1" stop-color="${FONDO_BASSO}"/>
    </linearGradient>
    <radialGradient id="vignetta" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.45" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.5"/>
    </radialGradient>
  </defs>
  <rect width="${L}" height="${H}" fill="url(#fondo)"/>
  ${GRIGLIA_SVG}
  ${tracciati}
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
const posterSvg = fotogramma(Math.round(FRAME * 0.13));
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
const bin = binarioFfmpeg;
const ingresso = path.join(lavoro, 'f-%04d.png');

const comuni = ['-y', '-framerate', String(FPS), '-i', ingresso];

await esegui(bin, [
  ...comuni,
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
