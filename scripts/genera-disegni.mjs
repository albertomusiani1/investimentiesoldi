#!/usr/bin/env node
/**
 * Genera i disegni di esempio del visualizzatore:
 *
 *   public/modelli/*.stl   modelli 3D in STL binario (il formato che ogni CAD
 *                          esporta: SolidWorks, Fusion, Inventor, Creo…)
 *   public/modelli/*.png   anteprima statica, mostrata quando JavaScript è
 *                          disattivato e come immagine di attesa
 *   public/disegni/*.svg   tavole 2D quotate, con cartiglio e tolleranze
 *
 * Si esegue una tantum (`npm run disegni`) e i file prodotti vengono
 * committati. Usa `sharp`, già presente come dipendenza di Astro.
 *
 * SOSTITUIRE PRIMA DI ANDARE ONLINE: sono pezzi inventati. I disegni veri
 * arrivano dal cliente — per il 3D basta un STL esportato dal suo CAD, per il
 * 2D un SVG o un PDF esportato dalla tavola.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CARTELLA_MODELLI = path.join(radice, 'public', 'modelli');
const CARTELLA_DISEGNI = path.join(radice, 'public', 'disegni');

// palette del sito
const INCHIOSTRO = '#1e2223';
const PRIMARIO = '#303435';
const ACCENTO = '#1b6e9b';
const TENUE = '#4f5658';
const CARTA = '#f8faf9';
const BORDO = '#c6cdcd';
/* Fondo del viewport 3D: l'anteprima deve combaciare con la scena viva. */
const VIEWPORT = '#1b1f20';

// ===========================================================================
// 1. Geometria: profili chiusi "a stella" rispetto al centro
//    Fra due profili con lo stesso numero di punti si costruisce un anello
//    estruso con soli quadrilateri: nessuna triangolazione complicata.
// ===========================================================================

const PASSI = 96;

/** Profilo circolare campionato in `passi` punti. */
function profiloCerchio(raggio, passi = PASSI) {
  return Array.from({ length: passi }, (_, i) => {
    const a = (i / passi) * Math.PI * 2;
    return [raggio * Math.cos(a), raggio * Math.sin(a)];
  });
}

/**
 * Profilo dentato: `denti` denti trapezoidali fra raggio di base e di testa.
 * Resta una funzione dell'angolo, quindi è compatibile con l'anello estruso.
 */
function profiloDentato(raggioBase, raggioTesta, denti, passi = PASSI) {
  return Array.from({ length: passi }, (_, i) => {
    const frazione = i / passi;
    const a = frazione * Math.PI * 2;
    const dentro = (frazione * denti) % 1; // 0..1 dentro il singolo dente
    // fianco in salita, testa piatta, fianco in discesa, piede piatto
    let raggio;
    if (dentro < 0.14) raggio = raggioBase + (dentro / 0.14) * (raggioTesta - raggioBase);
    else if (dentro < 0.5) raggio = raggioTesta;
    else if (dentro < 0.64) raggio = raggioTesta - ((dentro - 0.5) / 0.14) * (raggioTesta - raggioBase);
    else raggio = raggioBase;
    return [raggio * Math.cos(a), raggio * Math.sin(a)];
  });
}

/** Triangolo come terna di vertici 3D. */
const triangolo = (a, b, c) => [a, b, c];

/**
 * Anello estruso fra due profili concentrici, da z0 a z1.
 * Produce faccia superiore, inferiore e le due pareti.
 */
function anelloEstruso(interno, esterno, z0, z1) {
  const triangoli = [];
  const n = interno.length;

  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n;
    const ii = interno[i];
    const ij = interno[j];
    const ei = esterno[i];
    const ej = esterno[j];

    // faccia superiore (normale verso +z)
    triangoli.push(triangolo([ii[0], ii[1], z1], [ei[0], ei[1], z1], [ej[0], ej[1], z1]));
    triangoli.push(triangolo([ii[0], ii[1], z1], [ej[0], ej[1], z1], [ij[0], ij[1], z1]));

    // faccia inferiore (normale verso -z)
    triangoli.push(triangolo([ii[0], ii[1], z0], [ej[0], ej[1], z0], [ei[0], ei[1], z0]));
    triangoli.push(triangolo([ii[0], ii[1], z0], [ij[0], ij[1], z0], [ej[0], ej[1], z0]));

    // parete esterna
    triangoli.push(triangolo([ei[0], ei[1], z0], [ej[0], ej[1], z0], [ej[0], ej[1], z1]));
    triangoli.push(triangolo([ei[0], ei[1], z0], [ej[0], ej[1], z1], [ei[0], ei[1], z1]));

    // parete interna (normale verso il centro)
    triangoli.push(triangolo([ii[0], ii[1], z0], [ij[0], ij[1], z1], [ij[0], ij[1], z0]));
    triangoli.push(triangolo([ii[0], ii[1], z0], [ii[0], ii[1], z1], [ij[0], ij[1], z1]));
  }

  return triangoli;
}

// --- Modello 1: puleggia dentata -------------------------------------------
// I tre anelli si SOVRAPPONGONO di mezzo millimetro invece di combaciare:
// due superfici esattamente coincidenti si contendono la stessa profondita e
// l'ordinamento per profondita le fa lampeggiare una attraverso l'altra.
function puleggiaDentata() {
  const foro = profiloCerchio(11);
  const mozzoEsterno = profiloCerchio(23.5);
  const discoInterno = profiloCerchio(23);
  const discoEsterno = profiloCerchio(41.5);
  const coronaInterna = profiloCerchio(41);
  const dentiTesta = profiloDentato(46, 52, 24);

  return [
    // mozzo, spesso
    ...anelloEstruso(foro, mozzoEsterno, -13, 13),
    // disco centrale, sottile
    ...anelloEstruso(discoInterno, discoEsterno, -4, 4),
    // corona con la dentatura ricavata sul profilo esterno
    ...anelloEstruso(coronaInterna, dentiTesta, -11, 11),
  ];
}

// --- Modello 2: boccola flangiata ------------------------------------------
function boccolaFlangiata() {
  const foro = profiloCerchio(13);
  const collo = profiloCerchio(21);
  const collo2 = profiloCerchio(21.4);
  const flangia = profiloCerchio(34);

  return [
    // flangia di appoggio
    ...anelloEstruso(foro, flangia, 0, 7.4),
    // corpo cilindrico, che entra un poco nella flangia
    ...anelloEstruso(foro, collo, 7, 44),
    // svasatura di imbocco in testa
    ...anelloEstruso(profiloCerchio(16), collo2, 43.6, 47),
  ];
}

// ===========================================================================
// 2. STL binario
// ===========================================================================

function normale([a, b, c]) {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const lunghezza = Math.hypot(...n) || 1;
  return [n[0] / lunghezza, n[1] / lunghezza, n[2] / lunghezza];
}

function stlBinario(triangoli, intestazione) {
  const buffer = Buffer.alloc(84 + triangoli.length * 50);
  buffer.write(intestazione.slice(0, 79).padEnd(80, ' '), 0, 80, 'ascii');
  buffer.writeUInt32LE(triangoli.length, 80);

  let offset = 84;
  for (const t of triangoli) {
    const n = normale(t);
    for (const valore of [...n, ...t[0], ...t[1], ...t[2]]) {
      buffer.writeFloatLE(valore, offset);
      offset += 4;
    }
    buffer.writeUInt16LE(0, offset);
    offset += 2;
  }
  return buffer;
}

// ===========================================================================
// 3. Anteprima statica: stessa proiezione del visualizzatore, resa in SVG
// ===========================================================================

const LARGHEZZA_ANTEPRIMA = 1000;
const ALTEZZA_ANTEPRIMA = 700;

function ruota([x, y, z], imbardata, beccheggio) {
  const cy = Math.cos(imbardata);
  const sy = Math.sin(imbardata);
  const x1 = x * cy - y * sy;
  const y1 = x * sy + y * cy;

  const cp = Math.cos(beccheggio);
  const sp = Math.sin(beccheggio);
  return [x1, z * sp + y1 * cp, z * cp - y1 * sp];
}

function anteprimaSvg(triangoli) {
  const imbardata = -0.62;
  const beccheggio = 1.05;

  const ruotati = triangoli.map((t) => t.map((v) => ruota(v, imbardata, beccheggio)));

  const tutti = ruotati.flat();
  const minX = Math.min(...tutti.map((v) => v[0]));
  const maxX = Math.max(...tutti.map((v) => v[0]));
  const minY = Math.min(...tutti.map((v) => v[1]));
  const maxY = Math.max(...tutti.map((v) => v[1]));

  const scala =
    0.82 * Math.min(LARGHEZZA_ANTEPRIMA / (maxX - minX), ALTEZZA_ANTEPRIMA / (maxY - minY));
  const cx = LARGHEZZA_ANTEPRIMA / 2 - ((minX + maxX) / 2) * scala;
  const cy = ALTEZZA_ANTEPRIMA / 2 + ((minY + maxY) / 2) * scala;

  const proietta = (v) => [cx + v[0] * scala, cy - v[1] * scala, v[2]];

  const facce = ruotati
    .map((t) => {
      const p = t.map(proietta);
      const n = normale(t);
      const profondita = (p[0][2] + p[1][2] + p[2][2]) / 3;
      return { p, n, profondita };
    })
    .filter((f) => f.n[2] > 0) // scarta le facce che guardano via
    .sort((a, b) => a.profondita - b.profondita);

  const luce = [-0.35, 0.5, 0.79];
  const corpo = facce
    .map((f) => {
      const lambert = Math.max(0, f.n[0] * luce[0] + f.n[1] * luce[1] + f.n[2] * luce[2]);
      const tono = Math.round(88 + lambert * 132);
      const colore = `rgb(${Math.round(tono * 0.9)},${Math.round(tono * 0.96)},${tono})`;
      const d = f.p.map((v, i) => `${i === 0 ? 'M' : 'L'}${v[0].toFixed(1)} ${v[1].toFixed(1)}`).join('') + 'Z';
      return `<path d="${d}" fill="${colore}"/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGHEZZA_ANTEPRIMA}" height="${ALTEZZA_ANTEPRIMA}" viewBox="0 0 ${LARGHEZZA_ANTEPRIMA} ${ALTEZZA_ANTEPRIMA}">
  <rect width="${LARGHEZZA_ANTEPRIMA}" height="${ALTEZZA_ANTEPRIMA}" fill="${VIEWPORT}"/>
  <g shape-rendering="crispEdges">${corpo}</g>
</svg>`;
}

// ===========================================================================
// 4. Tavole 2D quotate
// ===========================================================================

/** Quota lineare orizzontale con frecce e testo. */
function quotaOrizzontale(x1, x2, y, testo, opzioni = {}) {
  const sopra = opzioni.sopra ?? true;
  const sfalso = opzioni.sfalso ?? 0;
  const yt = sopra ? y - 7 : y + 16;
  return `
    <g stroke="${TENUE}" stroke-width="0.8" fill="none">
      <path d="M${x1} ${y - 5}v10M${x2} ${y - 5}v10"/>
      <path d="M${x1} ${y}H${x2}"/>
      <path d="M${x1} ${y}l9 -3v6z" fill="${TENUE}" stroke="none"/>
      <path d="M${x2} ${y}l-9 -3v6z" fill="${TENUE}" stroke="none"/>
    </g>
    <text x="${(x1 + x2) / 2 + sfalso}" y="${yt}" text-anchor="middle" font-family="'DejaVu Sans Mono',monospace" font-size="13" fill="${INCHIOSTRO}">${testo}</text>`;
}

/** Quota lineare verticale. */
function quotaVerticale(y1, y2, x, testo) {
  return `
    <g stroke="${TENUE}" stroke-width="0.8" fill="none">
      <path d="M${x - 5} ${y1}h10M${x - 5} ${y2}h10"/>
      <path d="M${x} ${y1}V${y2}"/>
      <path d="M${x} ${y1}l-3 9h6z" fill="${TENUE}" stroke="none"/>
      <path d="M${x} ${y2}l-3 -9h6z" fill="${TENUE}" stroke="none"/>
    </g>
    <text x="${x - 10}" y="${(y1 + y2) / 2 + 4}" text-anchor="end" font-family="'DejaVu Sans Mono',monospace" font-size="13" fill="${INCHIOSTRO}">${testo}</text>`;
}

/** Riferimento con linea di richiamo. */
function richiamo(x, y, dx, dy, testo) {
  return `
    <g stroke="${ACCENTO}" stroke-width="1" fill="none">
      <path d="M${x} ${y}l${dx} ${dy}h${dx > 0 ? 26 : -26}"/>
      <circle cx="${x}" cy="${y}" r="2.5" fill="${ACCENTO}"/>
    </g>
    <text x="${x + dx + (dx > 0 ? 32 : -32)}" y="${y + dy + 4}" text-anchor="${dx > 0 ? 'start' : 'end'}" font-family="'DejaVu Sans Mono',monospace" font-size="12" fill="${ACCENTO}">${testo}</text>`;
}

function cartiglio(L, H, campi) {
  const larghezza = 340;
  const altezza = 96;
  const x = L - larghezza - 24;
  const y = H - altezza - 24;
  const righe = campi
    .map(
      (campo, i) => `
      <text x="${x + 12}" y="${y + 22 + i * 24}" font-family="'DejaVu Sans Mono',monospace" font-size="10" fill="${TENUE}">${campo[0]}</text>
      <text x="${x + 110}" y="${y + 22 + i * 24}" font-family="'DejaVu Sans Mono',monospace" font-size="12" fill="${INCHIOSTRO}">${campo[1]}</text>
      <path d="M${x} ${y + 30 + i * 24}H${x + larghezza}" stroke="${BORDO}" stroke-width="0.6"/>`
    )
    .join('');

  return `
    <g>
      <rect x="${x}" y="${y}" width="${larghezza}" height="${altezza}" fill="none" stroke="${INCHIOSTRO}" stroke-width="1.4"/>
      ${righe}
    </g>`;
}

function corniceTavola(L, H) {
  return `
    <rect width="${L}" height="${H}" fill="${CARTA}"/>
    <rect x="14" y="14" width="${L - 28}" height="${H - 28}" fill="none" stroke="${INCHIOSTRO}" stroke-width="1.6"/>`;
}

/** Tavola 1 — sezione della sede pistone di una pinza freno. */
function tavolaSedePistone() {
  const L = 1400;
  const H = 990;
  const cx = 560;
  const cy = 430;

  const rSede = 168;
  const rGola = 196;
  const profondita = 250;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}">
  ${corniceTavola(L, H)}

  <!-- sezione: corpo pinza con sede del pistone -->
  <g stroke="${INCHIOSTRO}" stroke-width="2" fill="none">
    <path d="M${cx - 330} ${cy - 300}h660v600h-660z"/>
    <path d="M${cx - rSede} ${cy - 300}v${profondita}h${rSede * 2}v-${profondita}"/>
    <path d="M${cx - rSede} ${cy - 300 + profondita}h${rSede * 2}"/>
  </g>

  <!-- gola per l'anello di tenuta -->
  <g stroke="${INCHIOSTRO}" stroke-width="1.6" fill="none">
    <path d="M${cx - rSede} ${cy - 190}h-28v34h28"/>
    <path d="M${cx + rSede} ${cy - 190}h28v34h-28"/>
  </g>

  <!-- tratteggio di sezione -->
  <defs>
    <pattern id="tratteggio" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <path d="M0 0V12" stroke="${TENUE}" stroke-width="0.8" opacity="0.65"/>
    </pattern>
  </defs>
  <path d="M${cx - 330} ${cy - 300}h${330 - rSede}v${profondita}h${rSede * 2}v-${profondita}h${330 - rSede}v600h-660z" fill="url(#tratteggio)" stroke="none"/>

  <!-- assi -->
  <g stroke="${ACCENTO}" stroke-width="1" stroke-dasharray="18 6 4 6" opacity="0.9">
    <path d="M${cx} ${cy - 350}V${cy + 350}"/>
  </g>

  ${quotaOrizzontale(cx - rSede, cx + rSede, cy - 340, 'Ø 84,00 H7  +0,030 / 0')}
  ${quotaOrizzontale(cx - 330, cx + 330, cy - 380, '165,0 ±0,2')}
  ${quotaVerticale(cy - 300, cy - 300 + profondita, cx - 400, '62,5 ±0,1')}
  ${quotaVerticale(cy - 300, cy + 300, cx - 470, '150,0')}

  ${richiamo(cx - rSede - 14, cy - 173, -60, -70, 'gola 3,2 × 2,1 — ISO 3601')}
  ${richiamo(cx + rSede, cy - 60, 90, 90, 'Ra 0,4 — rettificato')}
  ${richiamo(cx + rSede, cy - 300, 70, -66, 'smusso 1 × 45°')}

  <text x="${cx}" y="${cy + 400}" text-anchor="middle" font-family="'DejaVu Sans Mono',monospace" font-size="15" fill="${PRIMARIO}">SEZIONE A-A</text>

  <g font-family="'DejaVu Sans Mono',monospace" font-size="11" fill="${TENUE}">
    <text x="1000" y="120">TOLLERANZE GENERALI ISO 2768-mK</text>
    <text x="1000" y="146">QUOTE IN MILLIMETRI</text>
    <text x="1000" y="172">SMUSSI NON QUOTATI 0,5 × 45°</text>
    <text x="1000" y="198">MATERIALE  GJS-500-7</text>
    <text x="1000" y="224">TRATTAMENTO  NESSUNO</text>
  </g>

  ${cartiglio(L, H, [
    ['DISEGNO', 'Sede pistone — sez. A-A'],
    ['CODICE', 'PT-0104-A'],
    ['SCALA', '1:2'],
    ['REVISIONE', 'A — 18/06/2025'],
  ])}
</svg>`;
}

/** Tavola 2 — schema della linea di collaudo tenuta. */
function tavolaSchemaCollaudo() {
  const L = 1400;
  const H = 990;

  const stazione = (x, y, etichetta, evidenziata) => `
    <g>
      <rect x="${x}" y="${y}" width="180" height="120" rx="4" fill="${evidenziata ? '#e2eef5' : 'none'}" stroke="${evidenziata ? ACCENTO : INCHIOSTRO}" stroke-width="1.8"/>
      <text x="${x + 90}" y="${y + 52}" text-anchor="middle" font-family="'DejaVu Sans Mono',monospace" font-size="13" fill="${INCHIOSTRO}">${etichetta[0]}</text>
      <text x="${x + 90}" y="${y + 76}" text-anchor="middle" font-family="'DejaVu Sans Mono',monospace" font-size="11" fill="${TENUE}">${etichetta[1]}</text>
    </g>`;

  const valvola = (x, y) => `
    <g stroke="${INCHIOSTRO}" stroke-width="1.6" fill="none">
      <path d="M${x - 14} ${y - 12}l28 24M${x - 14} ${y + 12}l28 -24M${x - 14} ${y - 12}v24M${x + 14} ${y - 12}v24"/>
    </g>`;

  const strumento = (x, y, sigla) => `
    <g>
      <circle cx="${x}" cy="${y}" r="22" fill="${CARTA}" stroke="${INCHIOSTRO}" stroke-width="1.6"/>
      <path d="M${x - 22} ${y}h44" stroke="${INCHIOSTRO}" stroke-width="1"/>
      <text x="${x}" y="${y - 6}" text-anchor="middle" font-family="'DejaVu Sans Mono',monospace" font-size="11" fill="${INCHIOSTRO}">${sigla[0]}</text>
      <text x="${x}" y="${y + 15}" text-anchor="middle" font-family="'DejaVu Sans Mono',monospace" font-size="10" fill="${TENUE}">${sigla[1]}</text>
    </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}">
  ${corniceTavola(L, H)}

  <text x="60" y="80" font-family="'DejaVu Sans Mono',monospace" font-size="16" fill="${PRIMARIO}">SCHEMA PNEUMATICO — LINEA COLLAUDO TENUTA</text>

  <!-- linea di alimentazione -->
  <g stroke="${INCHIOSTRO}" stroke-width="2.4" fill="none">
    <path d="M80 200H1300"/>
  </g>
  <text x="80" y="186" font-family="'DejaVu Sans Mono',monospace" font-size="11" fill="${TENUE}">ARIA 6 bar — FILTRATA 5 µm</text>

  ${valvola(300, 200)}
  ${valvola(700, 200)}
  ${valvola(1100, 200)}

  <!-- discese verso le tre stazioni -->
  <g stroke="${INCHIOSTRO}" stroke-width="1.8" fill="none">
    <path d="M300 200V330"/>
    <path d="M700 200V330"/>
    <path d="M1100 200V330"/>
  </g>

  ${strumento(300, 300, ['PT', '0-10 bar'])}
  ${strumento(700, 300, ['PT', '0-10 bar'])}
  ${strumento(1100, 300, ['PT', '0-10 bar'])}

  ${stazione(210, 360, ['STAZIONE 1', 'precarico 0,5 bar'], false)}
  ${stazione(610, 360, ['STAZIONE 2', 'prova 4,0 bar'], false)}
  ${stazione(1010, 360, ['STAZIONE 3', 'caduta 60 s'], true)}

  <!-- rulliera -->
  <g stroke="${PRIMARIO}" stroke-width="2.6" fill="none">
    <path d="M80 560H1300"/>
  </g>
  <g fill="${PRIMARIO}">
    ${[140, 300, 460, 620, 780, 940, 1100, 1260]
      .map((x) => `<circle cx="${x}" cy="596" r="18"/>`)
      .join('')}
  </g>
  <text x="80" y="640" font-family="'DejaVu Sans Mono',monospace" font-size="11" fill="${TENUE}">RULLIERA MOTORIZZATA — 240 pz/h</text>

  <g stroke="${INCHIOSTRO}" stroke-width="1.4" stroke-dasharray="6 5" fill="none">
    <path d="M300 480V554M700 480V554M1100 480V554"/>
  </g>

  ${quotaOrizzontale(300, 700, 700, '1 600 interasse stazioni', { sopra: true })}
  ${quotaOrizzontale(80, 1300, 750, '5 400 lunghezza utile linea', { sopra: false })}

  ${richiamo(1100, 420, 90, -110, 'stazione a caduta di pressione')}

  <g font-family="'DejaVu Sans Mono',monospace" font-size="11" fill="${TENUE}">
    <text x="80" y="830">LEGENDA</text>
    <text x="80" y="856">PT   trasduttore di pressione, classe 0,25</text>
    <text x="80" y="878">↕    valvola 2/2 comandata</text>
    <text x="80" y="900">– –  interfaccia di presa sul pezzo</text>
  </g>

  ${cartiglio(L, H, [
    ['DISEGNO', 'Linea collaudo — schema'],
    ['CODICE', 'PT-0207-A'],
    ['SCALA', 'NON IN SCALA'],
    ['REVISIONE', 'A — 14/04/2025'],
  ])}
</svg>`;
}

// ===========================================================================
// 5. Scrittura
// ===========================================================================

await mkdir(CARTELLA_MODELLI, { recursive: true });
await mkdir(CARTELLA_DISEGNI, { recursive: true });

const modelli = [
  { nome: 'puleggia-dentata', triangoli: puleggiaDentata(), titolo: 'Puleggia dentata Z=24 - PROJECTUNE' },
  { nome: 'boccola-flangiata', triangoli: boccolaFlangiata(), titolo: 'Boccola flangiata - PROJECTUNE' },
];

for (const modello of modelli) {
  const stl = stlBinario(modello.triangoli, modello.titolo);
  await writeFile(path.join(CARTELLA_MODELLI, `${modello.nome}.stl`), stl);

  const png = await sharp(Buffer.from(anteprimaSvg(modello.triangoli)))
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  await writeFile(path.join(CARTELLA_MODELLI, `${modello.nome}.png`), png);

  console.log(
    `${modello.nome}.stl  ${modello.triangoli.length} triangoli, ${(stl.length / 1024).toFixed(0)} kB` +
      `   ·   anteprima ${(png.length / 1024).toFixed(0)} kB`
  );
}

const tavole = [
  { nome: 'sede-pistone-sezione', svg: tavolaSedePistone() },
  { nome: 'linea-collaudo-schema', svg: tavolaSchemaCollaudo() },
];

for (const tavola of tavole) {
  await writeFile(path.join(CARTELLA_DISEGNI, `${tavola.nome}.svg`), tavola.svg);
  console.log(`${tavola.nome}.svg  ${(tavola.svg.length / 1024).toFixed(1)} kB`);
}
