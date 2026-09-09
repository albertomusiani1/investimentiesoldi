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
 * Uso: node scripts/genera-trame.mjs
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
