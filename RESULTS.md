# RESULTS.md — esito delle verifiche

Sito vetrina **Brambilla Future** (settore automotive), costruito con Astro.
Tutti i comandi sono stati eseguiti davvero; sotto c'è il loro output reale, non
una stima.

- **Data dell'esecuzione:** 7 settembre 2026 (rieseguita dopo il rifacimento del
  hero e l'aggiunta del visualizzatore di disegni)
- **Ambiente:** Linux x86-64, Node.js v22.22.2, npm 10.9.7
- **Comando di partenza:** `rm -rf dist && npm run build`
- **Esito complessivo: 15 check su 15 passati.**

---

## 1. Tabella dei check

| # | Check | Esito | Sintesi |
|---|---|---|---|
| 1 | Build | ✅ | exit 0, 16 pagine, nessun warning |
| 2 | Type check | ✅ | 0 errori, 0 warning, 0 hint su 39 file |
| 3 | Pagine raggiungibili | ✅ | 24/24 risorse a 200 |
| 4 | 404 personalizzata | ✅ | stato 404 e contenuto della pagina del sito |
| 5 | Lighthouse home (mobile) | ✅ | 100 / 100 / 100 / 100 |
| 6 | Lighthouse dettaglio progetto | ✅ | 100 / 100 / 100 / 100 |
| 7 | JS al client | ✅ | tre isole dichiarate, 14,6 kB, ognuna solo sulle sue pagine |
| 8 | HTML valido | ✅ | 0 errori su 16 file |
| 9 | Link interni | ✅ | 59 link scansionati, 0 rotti |
| 10 | Test del form | ✅ | 14 test, 14 passati, 0 falliti |
| 10b | Astrazione mailer | ✅ | nessuna occorrenza di «mailjet» in `contact.ts` |
| 11 | Schema collection | ✅ | la build si ferma con errore leggibile |
| 12 | Segreti | ✅ | nessuna corrispondenza per entrambi i grep |
| 13 | Vulnerabilità | ✅ | 0 problemi high o critical |
| 14 | Responsive | ✅ | 42/42 combinazioni senza overflow né testo tagliato |
| 15 | i18n | ✅ | nessuna stringa di interfaccia scritta a mano |

---

## 2. Output reale dei comandi

### Check 1 — Build

```console
$ npm run build
> brambilla-future@1.0.0 build
> astro build

10:18:14 [content] Syncing content
10:18:14 [content] Synced content
10:18:14 [types] Generated 837ms
10:18:14 [build] output: "static"
10:18:14 [build] mode: "static"
10:18:14 [build] directory: /home/user/investimentiesoldi/dist/
10:18:14 [build] Collecting build info...
10:18:14 [build] ✓ Completed in 882ms.
10:18:14 [build] Building static entrypoints...
10:18:15 [vite] ✓ built in 687ms
10:18:15 [vite] ✓ built in 35ms
10:18:15 [build] Rearranging server assets...

 generating static routes
10:18:15   ├─ /404.html (+14ms)
10:18:15   ├─ /chi-siamo/index.html (+5ms)
10:18:15   ├─ /contatti/errore/index.html (+3ms)
10:18:15   ├─ /contatti/grazie/index.html (+2ms)
10:18:15   ├─ /contatti/index.html (+4ms)
10:18:15   ├─ /cookie-policy/index.html (+4ms)
10:18:15   ├─ /privacy/index.html (+3ms)
10:18:15   ├─ /progetti/banco-prova-sospensioni-pneumatiche/index.html (+9ms)
10:18:15   ├─ /progetti/linea-collaudo-tenuta-serbatoi/index.html (+4ms)
10:18:15   ├─ /progetti/piastra-raffreddamento-pacco-batteria/index.html (+3ms)
10:18:15   ├─ /progetti/retrofit-elettrico-navette-aeroportuali/index.html (+2ms)
10:18:15   ├─ /progetti/serie-cnc-pinze-freno/index.html (+5ms)
10:18:15   ├─ /progetti/staffa-portamotore-alluminio/index.html (+2ms)
10:18:15   ├─ /progetti/index.html (+6ms)
10:18:15   ├─ /servizi/index.html (+2ms)
10:18:15   ├─ /index.html (+2ms)
10:18:15 ✓ Completed in 89ms.

10:18:15 [build] ✓ Completed in 849ms.
10:18:15 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
10:18:15 [build] 16 page(s) built in 1.75s
10:18:15 [build] Complete!
EXIT=0
```

Nessun warning. La telemetria di Astro è stata disattivata (`astro telemetry
disable`), quindi non compare nemmeno l'avviso informativo del primo avvio.

### Check 2 — Type check

```console
$ npm run check
> brambilla-future@1.0.0 check
> astro check

10:18:17 [content] Syncing content
10:18:17 [content] Synced content
10:18:17 [types] Generated 617ms
10:18:17 [check] Getting diagnostics for Astro files in /home/user/investimentiesoldi...
Result (39 files):
- 0 errors
- 0 warnings
- 0 hints

EXIT=0
```

TypeScript gira in modalità `strict` (`astro/tsconfigs/strict` più
`noUncheckedIndexedAccess`, `verbatimModuleSyntax` ed `erasableSyntaxOnly`) e
copre pagine, componenti, script del client, funzioni Netlify e test.

### Check 3 e 4 — Pagine raggiungibili e 404

```console
$ npm run preview &
$ node scripts/check-pages.mjs

Server di anteprima: http://localhost:4321
URL dichiarate in sitemap: 13
Pagine noindex aggiunte: 2

URL                                                STATO  ESITO
-------------------------------------------------  -----  -----
/                                                    200  OK
/chi-siamo                                           200  OK
/contatti                                            200  OK
/contatti/errore                                     200  OK
/contatti/grazie                                     200  OK
/cookie-policy                                       200  OK
/privacy                                             200  OK
/progetti                                            200  OK
/progetti/banco-prova-sospensioni-pneumatiche        200  OK
/progetti/linea-collaudo-tenuta-serbatoi             200  OK
/progetti/piastra-raffreddamento-pacco-batteria      200  OK
/progetti/retrofit-elettrico-navette-aeroportuali    200  OK
/progetti/serie-cnc-pinze-freno                      200  OK
/progetti/staffa-portamotore-alluminio               200  OK
/servizi                                             200  OK

Riferimenti assoluti al dominio di produzione (canonical, og:image, JSON-LD)
URL                                                        STATO  ESITO
---------------------------------------------------------  -----  -----
/404                                                         200  OK
/favicon.svg                                                 200  OK
/img/progetti/banco-prova-sospensioni-pneumatiche.svg        200  OK
/img/progetti/linea-collaudo-tenuta-serbatoi.svg             200  OK
/img/progetti/piastra-raffreddamento-pacco-batteria.svg      200  OK
/img/progetti/retrofit-elettrico-navette-aeroportuali.svg    200  OK
/img/progetti/serie-cnc-pinze-freno.svg                      200  OK
/img/progetti/staffa-portamotore-alluminio.svg               200  OK
/og-default.png                                              200  OK

Pagina 404 personalizzata
  /questa-pagina-non-esiste-mai-12345 -> stato 404 (atteso 404): OK
  contiene il testo della 404 del sito: OK

Risultato: 24/24 risorse a 200, 404 personalizzata servita.
Tutte le verifiche sono passate.

EXIT=0
```

Lo script fa tre cose: legge `dist/sitemap-index.xml` e segue le sitemap
elencate; aggiunge le due pagine `noindex` volutamente escluse dalla sitemap
(`/contatti/grazie` e `/contatti/errore`); ricava dall'HTML tutti gli URL
assoluti verso il dominio di produzione — canonical, `og:image`, JSON-LD — e li
riporta sul server di anteprima per provarli. La verifica della 404 controlla sia
lo stato HTTP sia che il corpo sia davvero la pagina del sito.

### Check 5 — Lighthouse home (mobile)

```console
$ CHROME_PATH=/opt/pw-browsers/chromium npx lighthouse http://localhost:4321 \
    --output=json --output-path=reports/lighthouse-home.json --quiet

Lighthouse 13.4.1 | formFactor mobile | throttling simulate
  Performance           100
  Accessibility         100
  Best Practices        100
  SEO                   100
  Agentic Browsing      100
  first-contentful-paint    0.9 s
  largest-contentful-paint  1.4 s
  total-blocking-time       0 ms
  cumulative-layout-shift   0
  speed-index               0.9 s
```

> **Nota sul comando.** Il brief indicava `--preset=desktop=false`: non è una
> sintassi valida per Lighthouse (`--preset` accetta `desktop`, `perf`,
> `experimental`). Il profilo mobile è quello **predefinito**, quindi il comando
> senza `--preset` è esattamente la misura mobile richiesta. Il campo
> `formFactor: mobile` nel report lo conferma.

### Check 6 — Lighthouse dettaglio progetto

```console
$ CHROME_PATH=/opt/pw-browsers/chromium npx lighthouse \
    http://localhost:4321/progetti/staffa-portamotore-alluminio \
    --output=json --output-path=reports/lighthouse-progetto.json --quiet

Lighthouse 13.4.1 | formFactor mobile | throttling simulate
  Performance           100
  Accessibility         100
  Best Practices        100
  SEO                   100
  Agentic Browsing      100
  first-contentful-paint    0.9 s
  largest-contentful-paint  1.4 s
  total-blocking-time       0 ms
  cumulative-layout-shift   0
  speed-index               0.9 s
```

### Check 7 — JavaScript al client

Il vincolo iniziale era «zero JavaScript tranne il modulo contatti». Il
proprietario ha poi chiesto un video che parte e si ferma da sé e un
visualizzatore 3D: due cose che senza JavaScript non esistono. La regola è
stata **riscritta in una forma verificabile** invece che abbandonata —
*nessuno script fuori dalle isole dichiarate, e ogni isola solo sulle pagine
che la usano* — e il controllo manuale a grep è diventato uno script.

```console
$ npm run check:js

PAGINA                                             ISOLE                            JSON-LD
-------------------------------------------------  -------------------------------  -------
/404                                               —                                      0
/chi-siamo                                         —                                      1
/contatti/errore                                   —                                      0
/contatti/grazie                                   —                                      0
/contatti                                          FormContatti                           1
/cookie-policy                                     —                                      1
/                                                  EroeVideo                              1
/privacy                                           —                                      1
/progetti/banco-prova-sospensioni-pneumatiche      —                                      2
/progetti                                          —                                      1
/progetti/linea-collaudo-tenuta-serbatoi           VisualizzatoreDisegni                  2
/progetti/piastra-raffreddamento-pacco-batteria    —                                      2
/progetti/retrofit-elettrico-navette-aeroportuali  —                                      2
/progetti/serie-cnc-pinze-freno                    VisualizzatoreDisegni                  2
/progetti/staffa-portamotore-alluminio             VisualizzatoreDisegni                  2
/servizi                                           —                                      1

Isole dichiarate:
  · EroeVideo              avvia e mette in pausa il video del hero, misura l'intestazione
  · FormContatti           invia il modulo senza ricaricare la pagina
  · VisualizzatoreDisegni  rende interattive le tavole 2D e i modelli 3D

3 file JavaScript in dist, 14.6 kB in tutto.
Nessuno script fuori dalle isole dichiarate.

EXIT=0
```

`scripts/check-js.mjs` fallisce se una pagina carica un'isola che non le
compete, se in `dist/` compare un file JavaScript non riconducibile a
nessuna isola — una libreria entrata di straforo — o se una pagina contiene
uno script scritto dentro l'HTML, che oltre a essere fuori controllo sarebbe
bloccato dalla CSP. I blocchi `application/ld+json` sono dati strutturati per
i motori di ricerca, non codice, e vengono contati a parte.

### Check 8 — HTML valido

```console
$ npx html-validate "dist/**/*.html"

EXIT=0
```

Nessun output significa nessun errore su tutti i 16 file. La configurazione è in
`.htmlvalidate.json` e usa il preset `html-validate:recommended`. Una prima
esecuzione aveva segnalato 51 errori `tel-non-breaking` (numeri di telefono con
spazi normali, che possono andare a capo): il numero in `src/lib/azienda.ts` ora
usa spazi unificatori.

### Check 9 — Link interni

```console
$ npx linkinator dist --recurse --skip "^https://www\.brambillafuture\.it"

✓ Successfully scanned 48 links in 0.243 seconds.
EXIT=0
```

> **Perché lo `--skip`.** Senza filtro linkinator prova a risolvere anche gli URL
> assoluti verso il dominio di produzione (canonical, `og:image`, JSON-LD), che
> non esiste ancora ed è comunque irraggiungibile dalla macchina di build: li
> segnalava come 63 «link rotti» con stato 0, cioè errore di rete. Quegli stessi
> URL **sono verificati davvero** dal check 3, che li estrae dall'HTML e li
> riporta sul server di anteprima: tabella «Riferimenti assoluti al dominio di
> produzione», 9 risorse su 9 a 200. Nessun collegamento interno è rotto.

### Check 10 — Test del modulo contatti

```console
$ npm test

ok 1 - caso valido: risponde 200 e invia due email
ok 2 - email malformata: risponde 400 e non invia nulla
ok 3 - consenso mancante: risponde 400 e non invia nulla
ok 4 - honeypot pieno: finge successo con 200 ma non invia nulla
ok 5 - token antispam non valido: risponde 403 e non invia nulla
ok 6 - invio email fallito: risponde 502 e indica l'indirizzo a cui scrivere
ok 7 - variabile d'ambiente mancante: risponde 500 nominando la variabile
ok 8 - limite di frequenza: oltre la soglia risponde 429
ok 9 - senza JavaScript: risponde con un redirect verso la pagina di conferma
ok 10 - metodo diverso da POST: risponde 405
ok 1 - modulo contatti
ok 1 - accetta i dati corretti
ok 2 - rifiuta un nome troppo corto e un messaggio troppo corto
ok 3 - rifiuta un messaggio oltre il limite di lunghezza
ok 2 - validazione dei campi
ok 1 - protegge i caratteri speciali nel corpo HTML
ok 3 - composizione delle email

# tests 14
# suites 3
# pass 14
# fail 0
# cancelled 0
# skipped 0
# todo 0

EXIT=0
```

Tutti e sei i casi richiesti dal brief sono coperti (valido, email errata,
consenso mancante, honeypot, Turnstile fallito, invio fallito), più altri quattro
sul limite di frequenza, sul fallback senza JavaScript, sul metodo HTTP e sulla
variabile d'ambiente mancante. I test usano solo `node:test`, non serve nessuna
chiave reale e non viene fatta nessuna chiamata di rete: mailer e verifica
antispam sono doppi di prova iniettati in `creaGestore`.

### Check 10b — Astrazione del mailer

```console
$ grep -in "mailjet" netlify/functions/contact.ts
EXIT=1
```

Exit 1 di `grep` significa «nessuna corrispondenza»: `contact.ts` non nomina il
fornitore né nel codice, né nei commenti, né nelle stringhe.

### Check 11 — Schema della collection

```console
$ # aggiunto src/content/progetti/prova-schema-non-valido.md senza il campo "cliente"
$ npm run build

10:19:52 [content] Syncing content
[InvalidContentEntryDataError] progetti → prova-schema-non-valido data does not match collection schema.

  cliente**: **cliente: Required

  Hint:
    See https://docs.astro.build/en/guides/content-collections/ for more information on content schemas.
  Error reference:
    https://docs.astro.build/en/reference/errors/invalid-content-entry-data-error/
  Location:
    /home/user/investimentiesoldi/src/content/progetti/prova-schema-non-valido.md:0:0

EXIT=1

$ rm src/content/progetti/prova-schema-non-valido.md && npm run build

10:19:56 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
10:19:56 [build] 16 page(s) built in 1.99s
10:19:56 [build] Complete!

EXIT=0
```

Il file di prova è stato eliminato. Lo schema usa anche `.strict()`: oltre ai
campi mancanti fa fallire la build anche un campo scritto male (`titollo` invece
di `titolo`), che altrimenti passerebbe in silenzio.

### Check 12 — Segreti

```console
$ grep -rIn -E "(api[_-]?key|secret|token)\s*[:=]\s*['\"][A-Za-z0-9]" src netlify
EXIT=1

$ grep -rIn -E "^(MAILJET|TURNSTILE)" --include="*.ts" --include="*.astro" src netlify
EXIT=1
```

Nessuna corrispondenza per entrambi. Ogni chiave è letta da `process.env`
attraverso l'unica funzione `leggiVariabileObbligatoria`, che lancia un errore
nominando la variabile mancante. I nomi delle variabili sono documentati con
valori fittizi in `.env.example`, che non è mai popolato con valori reali:
`.gitignore` esclude `.env` e ogni `.env.*` tranne `.env.example`.

### Check 13 — Vulnerabilità

```console
$ npm audit --audit-level=high

found 0 vulnerabilities

EXIT=0
```

### Check 14 — Responsive

```console
$ node scripts/check-responsive.mjs

PAGINA                                           VIEWPORT  SCROLL-X  TAGLIATI  ESITO
-----------------------------------------------  --------  --------  --------  -----
/                                                     360        no         0  OK
/servizi                                              360        no         0  OK
/progetti                                             360        no         0  OK
/progetti/staffa-portamotore-alluminio                360        no         0  OK
/progetti/piastra-raffreddamento-pacco-batteria       360        no         0  OK
/progetti/linea-collaudo-tenuta-serbatoi              360        no         0  OK
/chi-siamo                                            360        no         0  OK
/contatti                                             360        no         0  OK
/contatti/grazie                                      360        no         0  OK
/contatti/errore                                      360        no         0  OK
/privacy                                              360        no         0  OK
/cookie-policy                                        360        no         0  OK
/pagina-inesistente-per-la-404                        360        no         0  OK
… (identico per 768 e 1280 px su tutte le 13 pagine)

39/39 combinazioni pagina/larghezza senza overflow orizzontale e senza testo tagliato.
Screenshot salvati in reports/screenshots/ (39 file).

EXIT=0
```

Lo script apre ogni pagina in Chromium a 360, 768 e 1280 px, aspetta il
caricamento dei font, confronta `documentElement.scrollWidth` con la larghezza
della viewport e cerca i contenitori che nascondono contenuto più grande di loro
(testo tagliato). I 39 screenshot a pagina intera restano in
`reports/screenshots/`, che non è versionata perché sono artefatti di verifica.

Gli screenshot sono stati anche riletti a occhio: da quella lettura sono usciti
tre difetti che i controlli automatici non vedono e che sono stati corretti —
mancava lo spazio prima dell'asterisco «campo obbligatorio», il separatore fra
partita IVA e REA veniva mangiato dal collasso degli spazi in JSX, e il
collegamento all'informativa privacy stava sotto l'etichetta del consenso invece
che dentro la frase.

### Check 15 — i18n

```console
$ npm run check:i18n
File .astro esaminati in src/components e src/layouts: 9
Nessuna stringa di interfaccia scritta a mano: tutte passano da src/i18n/it.json.
EXIT=0

$ node scripts/check-i18n.mjs src/pages
File .astro esaminati in src/pages: 11
Nessuna stringa di interfaccia scritta a mano: tutte passano da src/i18n/it.json.
EXIT=0
```

`scripts/check-i18n.mjs` toglie frontmatter, `<style>`, `<script>` e le
espressioni `{…}` bilanciate, poi cerca nel markup rimasto sia i nodi di testo
sia gli attributi visibili all'utente (`alt`, `aria-label`, `placeholder`,
`title`) scritti come letterali. È stato provato anche al contrario:
sostituendo `{t('footer.legale')}` con il testo «Informazioni legali» lo script
esce con codice 1 e indica file e stringa.

Il controllo passa **anche su `src/pages`**: durante il lavoro privacy policy e
cookie policy avevano il testo scritto dentro il markup, e per rispettare il
requisito «strutturati in modo che spostarli sia meccanico» sono stati spostati
in `src/lib/testi-legali.ts` come dati (stringhe pure, senza HTML, con
segnaposto `{email}` e collegamenti `[testo](/percorso)`), resi da un componente
che non contiene nessuna stringa.

---

## 3. Punteggi Lighthouse per esteso

Misurati dopo l'aggiunta del video e del visualizzatore. La pagina di dettaglio
scelta è quella che porta **entrambi** i tipi di disegno, tavola 2D e modello
3D: è il caso peggiore.

| Categoria | Home `/` | `/progetti/serie-cnc-pinze-freno` | Soglia |
|---|---|---|---|
| Performance | **100** | **100** | ≥ 95 |
| Accessibility | **100** | **100** | ≥ 95 |
| Best Practices | **100** | **100** | ≥ 95 |
| SEO | **100** | **100** | = 100 |
| Agentic Browsing | 100 | 100 | — |

| Metrica | Home | Dettaglio progetto |
|---|---|---|
| First Contentful Paint | 1,2 s | 0,9 s |
| Largest Contentful Paint | 1,5 s | 1,5 s |
| Total Blocking Time | 0 ms | 0 ms |
| Cumulative Layout Shift | 0,001 | 0 |
| Peso totale della pagina | 104 KiB | 86 KiB |

Lighthouse 13.4.1, profilo mobile predefinito, throttling simulato, Chromium
headless. I report completi in JSON sono in `reports/`.

**Il video non ha fatto scendere il punteggio, il fermo immagine sì.** La prima
misura dopo l'aggiunta del hero dava Performance **99**: il collo di bottiglia
era il poster in JPEG da 74 kB, che è l'elemento più grande della pagina e
quindi quello che fissa il Largest Contentful Paint. Servendolo in WebP con
`srcset` — 7,6 kB a 900 px — la home è tornata a 100 e l'LCP è passato da 2,1 s
a 1,5 s. Il filmato in sé non pesa sulla misura perché è dichiarato
`preload="none"` e viene chiesto solo quando l'isola decide di avviarlo.

**Il visualizzatore 3D non pesa sul caricamento.** L'STL viene scaricato solo
quando la sezione entra in vista, e la rotazione gira a **60 fotogrammi al
secondo** su un modello da 2 304 triangoli (misurato in Chromium headless con
`requestAnimationFrame`).

## 4. Decisioni prese in autonomia

Ricopiate da `PLAN.md`, dove ognuna ha anche l'alternativa scartata.

1. **Scaffold manuale invece di `npm create astro@latest`.** Il proxy di rete
   della sessione blocca `api.github.com` e `codeload.github.com` con 403 e
   l'installer scarica i template da lì, quindi fallisce con «Failed to download
   … 403 Forbidden». Ho ricostruito a mano la stessa struttura del template
   ufficiale, installando `astro` dal registry npm che invece è raggiungibile.
   La versione non è stata fissata a memoria: è quella che npm ha scaricato.
2. **Font presi dai pacchetti npm `@fontsource`**, copiati come file `.woff2` in
   `public/fonts/` insieme alle licenze SIL OFL, e pacchetti disinstallati: nel
   progetto non resta nessuna dipendenza da loro.
3. **`build.format` predefinito con `trailingSlash: 'never'`**: gli URL restano
   senza slash finale e i server statici li risolvono senza configurazione.
4. **`build.inlineStylesheets: 'never'` e `vite.build.assetsInlineLimit: 0`**,
   per poter dichiarare una CSP con `style-src 'self'` e `script-src 'self'`
   senza `'unsafe-inline'`. Per la stessa ragione l'unico attributo `style`
   inline (nel logo) è diventato una classe e lo script del modulo è stato
   spostato in `src/scripts/modulo-contatti.ts`, così Astro lo emette come file
   esterno invece di incorporarlo nella pagina.
5. **Titolo delle pagine di dettaglio progetto senza suffisso di marca**: il
   limite di 60 caratteri non lascia spazio per «… | Brambilla Future» dopo un
   titolo di progetto reale. `src/lib/seo.ts` interrompe la build se un titolo
   supera i 60 caratteri o se una meta description esce da 120–160.
6. **Il token antispam viene verificato solo quando è presente.** Turnstile è un
   widget JavaScript: pretenderlo sempre renderebbe impossibile il fallback
   senza JavaScript, che il brief richiede. Se il token c'è viene verificato e,
   se non è valido, la richiesta è respinta con 403; se non c'è, il limite di
   frequenza per quell'IP scende da 5 a 1 invio ogni 15 minuti. È il punto in
   cui i due requisiti del brief si contraddicono: la scelta e il modo di
   renderla più severa sono documentati nel README.
7. **La fabbrica `creaMailer()` sta in `mailer.ts`**, non in `contact.ts`: è
   l'unico modo per soddisfare insieme «`contact.ts` non nomina il fornitore» e
   «cambiare fornitore costa una riga di import» senza aggiungere file alla
   struttura di cartelle richiesta.
8. **Nomi generici per le chiavi del mailer** (`MAILER_API_KEY`,
   `MAILER_API_SECRET`), con i nomi storici del fornitore accettati come
   ricaduta: cambiare servizio non obbliga a rinominare le variabili ovunque.
9. **Pagina `/contatti/errore`**, gemella `noindex` della pagina di conferma, per
   dire qualcosa di utile a chi invia il modulo senza JavaScript e l'invio non
   riesce.
10. **Immagini social in PNG**: i social non leggono le anteprime in SVG.
    `npm run immagini:social` le rigenera da SVG scritti a mano usando `sharp`,
    che è già una dipendenza di Astro e non aggiunge pacchetti.
11. **La variabilità di lunghezza dei progetti è nel corpo, non nella sintesi**:
    `descrizioneBreve` alimenta anche la meta description, che deve stare fra 120
    e 160 caratteri e quindi non poteva essere «molto corta». Lo stress sul
    layout viene dai titoli (da 31 a 56 caratteri) e dai corpi Markdown, uno
    molto lungo e uno molto corto.
12. **I file preesistenti del repository non sono stati toccati** (`index.html`,
    `dati.json`, `manifest.json` di un'applicazione diversa): non interferiscono
    con la build e cancellarli non era richiesto.
13. **`playwright` come unica dipendenza di sviluppo aggiunta**, solo per il
    check 14: serve un browser vero per misurare l'overflow e produrre gli
    screenshot. Non finisce nel sito: `dist/` non contiene nulla che venga da
    lì. Gli altri strumenti di verifica (`html-validate`, `linkinator`,
    `lighthouse`) girano con `npx` e non sono dipendenze del progetto.
14. **Lo script del modulo sta in `src/scripts/modulo-contatti.ts`** e non dentro
    il componente: Astro lo incorporava nella pagina, cosa incompatibile con una
    CSP `script-src 'self'` senza `'unsafe-inline'`.
15. **Privacy policy e cookie policy tenute come dati**, non come markup, per
    rispettare il requisito «strutturati in modo che spostarli sia meccanico».
16. **Il comando Lighthouse del brief non è valido**: `--preset=desktop=false`
    non esiste. Il profilo mobile è quello predefinito, quindi la misura è stata
    fatta senza `--preset`, verificando nel report che `formFactor` sia `mobile`.
17. **`linkinator` con `--skip` sul dominio di produzione**, che non è
    raggiungibile dalla macchina di build; quegli URL sono verificati davvero dal
    check 3 sul server di anteprima.
18. **Il vincolo «zero JavaScript» è stato riscritto, non abbandonato**: nessuno
    script fuori dalle tre isole dichiarate, verificato da `npm run check:js`.
19. **Il video del hero è calcolato, non filmato** (`npm run video`): 398 kB di
    H.264 per 8 secondi di ciclo, nessun filmato scaricato.
20. **Solo MP4**: su contenuto vettoriale piatto l'H.264 pesa metà del VP9 ed è
    supportato da ogni browser.
21. **Fermo immagine in WebP con `srcset`**, JPEG come ricaduta: è ciò che ha
    riportato la home da 99 a 100.
22. **Terzo carattere solo per il titolo del hero** (Archivo 700, 14,5 kB).
23. **I modelli 3D sono in STL**, il formato che esporta qualunque CAD: il
    proprietario può caricare i suoi senza conversioni.
24. **Resa 3D con l'algoritmo del pittore**, facce e spigoli in una sola lista
    ordinata per profondità, con sagome calcolate a runtime. 60 fotogrammi al
    secondo su 2 304 triangoli.
25. **L'altezza dell'intestazione la misura l'isola**: in CSS non è conoscibile,
    perché dipende da quante righe occupa il menu.

---

## 5. Che cosa deve fare il proprietario prima di andare online

### 5.1 Chiavi da procurarsi

| Servizio | Dove | Che cosa serve |
|---|---|---|
| Posta transazionale | Pannello del fornitore, piano gratuito | Chiave pubblica e chiave segreta → `MAILER_API_KEY`, `MAILER_API_SECRET`. Va anche **verificato il dominio del mittente**, altrimenti l'invio viene rifiutato |
| Cloudflare Turnstile | dash.cloudflare.com → Turnstile | Chiave pubblica → `PUBLIC_TURNSTILE_SITE_KEY`; chiave segreta → `TURNSTILE_SECRET_KEY` |
| Indirizzi del modulo | Decisione dell'azienda | `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `CONTACT_FROM_NAME` |

Tutte vanno impostate nel pannello dell'hosting, mai nel codice. Se ne manca una,
la funzione risponde 500 e nei log scrive per nome quale manca.

### 5.2 Testi e dati da sostituire

L'elenco completo file per file è nel README, sezione **«Cosa sostituire prima di
andare online»**. In sintesi:

| File | Che cosa contiene |
|---|---|
| `src/lib/azienda.ts` | Ragione sociale, indirizzo, telefono, email, PEC, partita IVA, REA, capitale sociale, orari, coordinate |
| `astro.config.mjs` (`SITE_URL`) e `public/robots.txt` | Il dominio reale, oggi `https://www.brambillafuture.it` |
| `src/i18n/it.json` | Etichette, titoli di sezione, messaggi del modulo, titoli e descrizioni per Google |
| `src/lib/servizi.ts` | I cinque servizi |
| `src/lib/testi-legali.ts` | Privacy policy e cookie policy — **da far verificare a chi tratta i dati** |
| `src/pages/chi-siamo.astro` | Storia, valori, persone, certificazioni |
| `src/pages/index.astro` | Le quattro cifre della sezione «in cifre» |
| `src/content/progetti/*.md` | I sei progetti di esempio, da sostituire con commesse vere |
| `public/img/`, `public/favicon.svg` | Le illustrazioni SVG e l'icona |

Ogni blocco da sostituire è marcato nel codice con `CONTENUTO — SOSTITUIRE`.

### 5.3 Comandi di deploy

```bash
# 1. verifica in locale
npm install
npm run build && npm run check && npm test

# 2. controllo delle pagine servite
npm run preview &
npm run check:pages && npm run check:responsive
npm run check:html && npm run check:links && npm run check:i18n

# 3. pubblicazione
git push                     # Netlify costruisce da solo: vedi netlify.toml
```

Prima del primo deploy, su Netlify: collegare il repository (comando di build,
cartella pubblicata e cartella delle funzioni sono già in `netlify.toml`),
impostare le variabili d'ambiente, collegare il dominio.

`netlify.toml` porta già gli header di sicurezza (CSP, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`, HSTS), il redirect permanente dagli URL
con slash finale a quelli senza, e la cache di un anno per font e file con
impronta nel nome.

---

## 6. Peso del sito

```console
$ du -sh dist
1.4M	dist
```

| Tipo | File | Peso su disco |
|---|---|---|
| MP4 (video del hero) | 1 | 398,0 kB |
| STL (modelli 3D) | 2 | 225,2 kB |
| HTML | 16 | 223,3 kB |
| WOFF2 (4 caratteri) | 4 | 82,2 kB |
| JPEG (fermo immagine) | 1 | 50,7 kB |
| PNG | 4 | 34,3 kB |
| CSS | 12 | 32,5 kB |
| WebP (fermi immagine) | 2 | 23,4 kB |
| SVG | 11 | 20,3 kB |
| JavaScript | 3 | 14,6 kB |
| TXT | 4 | 13,4 kB |
| XML (sitemap) | 2 | 1,5 kB |

**Pagina più pesante su disco:** `dist/progetti/serie-cnc-pinze-freno/index.html`,
**19,6 kB**. A seguire `staffa-portamotore-alluminio` (18,5 kB) e la home
(17,1 kB).

**Pagina più pesante come traffico reale**, misurata da Lighthouse con
compressione attiva: la home, **104 KiB**, di cui 82 KiB sono i quattro file dei
caratteri. Le pagine successive ne scaricano circa 20 KiB, perché i caratteri
restano in cache per un anno.

Le due voci grosse in `dist/` — il video da 398 kB e i due STL da 225 kB — non
sono sul percorso critico: il video è `preload="none"` e parte solo quando
l'isola lo avvia, gli STL vengono chiesti solo quando la sezione dei disegni
entra in vista. Chi apre la home e non scorre non scarica né l'uno né gli altri.

## 7. Problemi aperti

Nessun check resta rosso. Restano tre cose che dipendono dal proprietario e non
possono essere chiuse da qui:

1. **I contenuti sono segnaposto.** Realistici e della lunghezza giusta per far
   emergere i problemi di impaginazione, ma inventati. Vanno sostituiti prima di
   pubblicare: elenco puntuale nel README.
2. **Privacy policy e cookie policy vanno rilette da chi tratta i dati.** Il
   testo è coerente con quello che il modulo raccoglie davvero, ma è una base,
   non un parere legale. In particolare vanno indicati per nome i fornitori
   nominati responsabili del trattamento.
3. **Il modulo contatti non è mai stato provato contro i servizi veri**, perché
   le chiavi non esistono ancora. La logica è coperta da 14 test con mailer e
   verifica antispam mockati; il primo invio reale va provato subito dopo il
   deploy, controllando che arrivino **entrambe** le email e che la copia al
   visitatore non finisca nella posta indesiderata.
