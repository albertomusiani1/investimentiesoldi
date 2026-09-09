#!/usr/bin/env node
/**
 * Genera le trame esagonali usate come sfondo.
 *
 * L'esagono è la forma del marchio: ripeterlo in filigrana dietro le sezioni
 * scure lega insieme le pagine senza dover mettere il logo dappertutto.
 *
 * Le tessere sono **continue**: le maglie sono disegnate su un reticolo che
 * si ripete esattamente ogni (√3·lato, 3·lato), e il viewBox taglia il resto.
 * Ripetendo l'immagine col `background-repeat` del CSS non si vedono giunture.
 *
 * Il colore è un grigio medio: schiarisce sui fondi scuri e scurisce su quelli
 * chiari, quindi la stessa tessera serve in tutti e due i casi e l'intensità
 * si regola dal CSS con l'opacità.
 *
 * Produce anche la grana: un velo di rumore che copre tutta la pagina. È il
 * trucco che distingue una schermata piatta da una che sembra stampata —
 * rompe le campiture uniformi e le sfumature, che altrimenti mostrano le
 * bande di colore.
 *
 * Uso: node scripts/genera-trame.mjs
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const GRIGIO = '#7d8688';
const arrotonda = (v) => Number.parseFloat(v.toFixed(2));

/** Un esagono con la punta in alto, centrato in (cx, cy). */
function esagono(cx, cy, lato) {
  const punti = [];
  for (let i = 0; i < 6; i += 1) {
    const angolo = (Math.PI / 180) * (60 * i - 90);
    punti.push(`${arrotonda(cx + lato * Math.cos(angolo))} ${arrotonda(cy + lato * Math.sin(angolo))}`);
  }
  return `M${punti.join('L')}Z`;
}

/**
 * Tessera di favo continua.
 * @param {number} lato    lato dell'esagono in unità SVG
 * @param {number} spessore spessore della linea
 */
function tessera(lato, spessore) {
  const larghezza = Math.sqrt(3) * lato;
  const altezza = 3 * lato;
  const tracciati = [];
  // Si disegna anche fuori dalla tessera: il viewBox taglia, e i pezzi
  // tagliati combaciano con quelli della tessera accanto.
  for (let riga = -1; riga <= 3; riga += 1) {
    for (let colonna = -1; colonna <= 2; colonna += 1) {
      const cx = colonna * larghezza + (Math.abs(riga % 2) === 1 ? larghezza / 2 : 0);
      const cy = riga * 1.5 * lato;
      tracciati.push(esagono(cx, cy, lato));
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${arrotonda(larghezza)}" ` +
    `height="${arrotonda(altezza)}" viewBox="0 0 ${arrotonda(larghezza)} ${arrotonda(altezza)}">` +
    `<path d="${tracciati.join('')}" fill="none" stroke="${GRIGIO}" ` +
    `stroke-width="${spessore}"/></svg>\n`
  );
}

const uscite = [
  ['public/img/trama-esagoni.svg', tessera(28, 1)],
  ['public/img/trama-esagoni-fitta.svg', tessera(12, 0.8)],
];

for (const [relativo, contenuto] of uscite) {
  await writeFile(path.join(radice, relativo), contenuto, 'utf8');
  console.log(`${relativo} — ${contenuto.length} byte`);
}

/**
 * Grana: rumore monocromatico su fondo trasparente, in una tessera che si
 * ripete. Il valore di grigio è casuale, l'opacità è bassa e costante, così
 * la stessa immagine schiarisce e scurisce allo stesso modo su qualunque
 * fondo. Il seme è fisso: rigenerando il file non cambia, e il repository
 * non si riempie di differenze inutili.
 */
const LATO_GRANA = 160;

function rumore() {
  const dati = Buffer.alloc(LATO_GRANA * LATO_GRANA * 4);
  // Generatore lineare congruenziale: deterministico e senza dipendenze.
  let seme = 20260909;
  const prossimo = () => (seme = (seme * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < LATO_GRANA * LATO_GRANA; i += 1) {
    const tono = Math.floor(prossimo() * 256);
    dati[i * 4] = tono;
    dati[i * 4 + 1] = tono;
    dati[i * 4 + 2] = tono;
    dati[i * 4 + 3] = 255;
  }
  return dati;
}

const grana = await sharp(rumore(), {
  raw: { width: LATO_GRANA, height: LATO_GRANA, channels: 4 },
})
  .webp({ quality: 42, alphaQuality: 60 })
  .toBuffer();

await writeFile(path.join(radice, 'public/img/grana.webp'), grana);
console.log(`public/img/grana.webp — ${(grana.length / 1024).toFixed(1)} kB`);
