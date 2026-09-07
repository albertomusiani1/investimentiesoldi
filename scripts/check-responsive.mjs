#!/usr/bin/env node
/**
 * Verifica il comportamento responsive di tutte le pagine.
 *
 * Per ogni pagina e per ogni larghezza (360, 768, 1280):
 *   - carica la pagina nel browser;
 *   - controlla che non ci sia scorrimento orizzontale
 *     (`documentElement.scrollWidth` non deve superare la viewport);
 *   - cerca elementi con testo tagliato, cioè con `overflow` nascosto e
 *     contenuto più largo o più alto del contenitore;
 *   - salva uno screenshot a pagina intera in `reports/screenshots/`.
 *
 * Esce con codice 1 se trova anche un solo problema.
 * Uso: npm run preview & ; node scripts/check-responsive.mjs [base-url]
 */
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const radice = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cartellaScreenshot = path.join(radice, 'reports', 'screenshots');
const base = (process.argv[2] ?? process.env.BASE_URL ?? 'http://localhost:4321').replace(/\/$/, '');

const LARGHEZZE = [360, 768, 1280];

const PAGINE = [
  '/',
  '/servizi',
  '/progetti',
  '/progetti/staffa-portamotore-alluminio',
  '/progetti/serie-cnc-pinze-freno',
  '/progetti/piastra-raffreddamento-pacco-batteria',
  '/progetti/linea-collaudo-tenuta-serbatoi',
  '/chi-siamo',
  '/contatti',
  '/contatti/grazie',
  '/contatti/errore',
  '/privacy',
  '/cookie-policy',
  '/pagina-inesistente-per-la-404',
];

/** Cerca testo tagliato: contenitori che nascondono contenuto più grande di loro. */
const CERCA_TAGLIATI = () => {
  const problemi = [];
  const tolleranza = 2;

  for (const elemento of document.querySelectorAll('body *')) {
    const stile = getComputedStyle(elemento);
    if (stile.display === 'none' || stile.visibility === 'hidden') continue;

    const nascondeX = ['hidden', 'clip'].includes(stile.overflowX);
    const nascondeY = ['hidden', 'clip'].includes(stile.overflowY);
    if (!nascondeX && !nascondeY) continue;

    // Gli elementi resi invisibili di proposito (honeypot, solo screen reader)
    // sono minuscoli: non sono testo tagliato.
    if (elemento.clientWidth <= 1 || elemento.clientHeight <= 1) continue;

    const troppoLargo = nascondeX && elemento.scrollWidth - elemento.clientWidth > tolleranza;
    const troppoAlto = nascondeY && elemento.scrollHeight - elemento.clientHeight > tolleranza;

    if (troppoLargo || troppoAlto) {
      problemi.push({
        selettore:
          elemento.tagName.toLowerCase() +
          (elemento.id ? `#${elemento.id}` : '') +
          (elemento.className && typeof elemento.className === 'string'
            ? `.${elemento.className.trim().split(/\s+/).join('.')}`
            : ''),
        cliente: `${elemento.clientWidth}×${elemento.clientHeight}`,
        contenuto: `${elemento.scrollWidth}×${elemento.scrollHeight}`,
      });
    }
  }

  return problemi;
};

const MISURA_PAGINA = () => ({
  scrollWidth: document.documentElement.scrollWidth,
  innerWidth: window.innerWidth,
});

await mkdir(cartellaScreenshot, { recursive: true });

// Se la macchina ha già un Chromium (come gli ambienti CI con
// PLAYWRIGHT_BROWSERS_PATH preimpostato) si usa quello, evitando il download.
const chromiumDiSistema = process.env['CHROME_PATH'] ?? '/opt/pw-browsers/chromium';

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  ...(existsSync(chromiumDiSistema) ? { executablePath: chromiumDiSistema } : {}),
});

const righe = [];

for (const larghezza of LARGHEZZE) {
  const contesto = await browser.newContext({
    viewport: { width: larghezza, height: 900 },
    deviceScaleFactor: 1,
  });
  const pagina = await contesto.newPage();

  for (const percorso of PAGINE) {
    await pagina.goto(`${base}${percorso}`, { waitUntil: 'load' });
    await pagina.evaluate(() => document.fonts.ready);

    const misura = await pagina.evaluate(MISURA_PAGINA);
    const tagliati = await pagina.evaluate(CERCA_TAGLIATI);

    const nome = (percorso === '/' ? 'home' : percorso.slice(1).replaceAll('/', '_')) + `-${larghezza}.png`;
    await pagina.screenshot({ path: path.join(cartellaScreenshot, nome), fullPage: true });

    const overflow = misura.scrollWidth - misura.innerWidth;
    righe.push({
      percorso,
      larghezza,
      overflow,
      tagliati,
      ok: overflow <= 0 && tagliati.length === 0,
    });
  }

  await contesto.close();
}

await browser.close();

const larghezzaColonna = Math.max(...righe.map((r) => r.percorso.length), 6);
console.log(`${'PAGINA'.padEnd(larghezzaColonna)}  VIEWPORT  SCROLL-X  TAGLIATI  ESITO`);
console.log(`${'-'.repeat(larghezzaColonna)}  --------  --------  --------  -----`);
for (const riga of righe) {
  console.log(
    `${riga.percorso.padEnd(larghezzaColonna)}  ${String(riga.larghezza).padStart(8)}  ` +
      `${String(riga.overflow > 0 ? `+${riga.overflow}px` : 'no').padStart(8)}  ` +
      `${String(riga.tagliati.length).padStart(8)}  ${riga.ok ? 'OK' : 'KO'}`
  );
}

const falliti = righe.filter((r) => !r.ok);
console.log(
  `\n${righe.length - falliti.length}/${righe.length} combinazioni pagina/larghezza senza overflow orizzontale e senza testo tagliato.`
);
console.log(`Screenshot salvati in reports/screenshots/ (${righe.length} file).`);

if (falliti.length > 0) {
  for (const riga of falliti) {
    console.error(`\nFALLITA ${riga.percorso} @ ${riga.larghezza}px — overflow ${riga.overflow}px`);
    for (const problema of riga.tagliati) {
      console.error(`  tagliato: ${problema.selettore} (visibile ${problema.cliente}, contenuto ${problema.contenuto})`);
    }
  }
  process.exit(1);
}
