# PLAN.md — Sito vetrina Brambilla Future (settore automotive)

Sito statico Astro, italiano, corporate sobrio. CSS puro, zero JS al client tranne
l'isola del form contatti. Collection `progetti` estendibile via file Markdown.

## Stato attuale

- 2026-08-30 09:40 — PLAN.md creato. Nessun codice ancora scritto.
- 2026-08-30 10:05 — Fasi 1–7 completate: setup, design system, layout, tutte le 10 pagine,
  collection con 6 progetti, form contatti con funzione Netlify e 14 test verdi, SEO e
  netlify.toml. Build e `astro check` puliti, check-pages 15/15. Restano le verifiche
  finali (fase 9) e la documentazione (README, RESULTS).
- 2026-08-30 11:40 — Sito separato in un repository dedicato, con storia propria: i tre
  file dell'applicazione preesistente non ne fanno parte. Nessuna modifica al codice del
  sito, quindi i 15 check restano validi.
- 2026-08-30 10:22 — **Lavoro concluso. Tutti i 15 check della Definizione di Fatto
  passano**, output reale in `RESULTS.md`. Lungo la fase 9 sono state corrette cinque
  cose: numeri di telefono con spazi normali (51 errori html-validate), CLS 0,307 in home
  (Performance 84 → 100), script del modulo incorporato nella pagina e quindi
  incompatibile con la CSP senza `unsafe-inline`, testi legali scritti dentro il markup
  invece che come dati, e tre difetti tipografici visti solo rileggendo gli screenshot.
  README e RESULTS.md scritti.

---

## Task list

### Fase 1 — Setup
- [x] Scaffold Astro con `npm create astro@latest` (template minimal + TypeScript strict)
- [x] Spostare lo scaffold nella root del repo senza toccare i file preesistenti
- [x] `engines.node` in `package.json` con la LTS attiva
- [x] `.gitignore`, `.env.example`
- [x] Integrazioni ufficiali: `@astrojs/sitemap`
- [x] Configurazione i18n Astro (`defaultLocale: 'it'`, `prefixDefaultLocale: false`)
- [x] Registrare le versioni esatte in `## Versioni installate`

### Fase 2 — Design system
- [x] Font self-hosted WOFF2 in `public/fonts/` con `font-display: swap`
- [x] `src/styles/global.css`: custom properties (palette, scala tipografica, scala spazi `--space-1`…`--space-8`)
- [x] Reset, stili base, focus visibile, `prefers-reduced-motion`
- [x] Breakpoint mobile-first 640 / 1024 / 1280
- [x] Verifica contrasto ≥ 4.5:1 sulle coppie colore usate

### Fase 3 — Layout e componenti
- [x] `src/i18n/it.json` + helper `t()`
- [x] `BaseLayout.astro` (skip link, header, footer, `lang="it"`)
- [x] `SEO.astro` (title, description, OG, Twitter, canonical assoluto, JSON-LD)
- [x] `Header.astro` / `Nav` (navigazione da tastiera, stato pagina corrente)
- [x] `Footer.astro`
- [x] `Card` progetto, `ServiceCard`, `Section`, `Button`, `Breadcrumbs`
- [x] Immagini SVG geometriche generate a mano (hero, progetti, mappa statica, OG)

### Fase 4 — Pagine
- [x] `/` Home (hero, servizi sintesi, 3 progetti in evidenza, CTA)
- [x] `/servizi` (4–5 servizi con descrizione estesa)
- [x] `/progetti` (griglia + filtro categoria solo CSS/HTML)
- [x] `/progetti/[slug]` (da Markdown)
- [x] `/chi-siamo`
- [x] `/contatti`
- [x] `/privacy`
- [x] `/cookie-policy`
- [x] `/404`
- [x] `/contatti/grazie` (fallback no-JS del form)

### Fase 5 — Collection progetti
- [x] `src/content.config.ts` con schema Zod (fallisce la build se un campo manca)
- [x] 6 progetti `.md` con contenuti realistici e lunghezze variabili
- [x] Documentare in README la procedura di aggiunta, con esempio commentato riga per riga

### Fase 6 — Form contatti
- [x] `netlify/functions/lib/mailer.ts` — interfaccia astratta, nessun riferimento al fornitore
- [x] `netlify/functions/lib/mailer-mailjet.ts` — unica implementazione
- [x] `netlify/functions/contact.ts` — validazione server, Turnstile, honeypot, rate limit, doppia email
- [x] Env var obbligatorie: errore esplicito che nomina la variabile mancante
- [x] Isola JS del form: stati loading / successo / errore senza reload
- [x] Fallback `<form method="POST">` funzionante senza JS
- [x] Test `npm test` con mailer e Turnstile mockati (6 casi)

### Fase 7 — SEO
- [x] `@astrojs/sitemap` → `sitemap-index.xml`
- [x] `public/robots.txt` con riferimento alla sitemap
- [x] Title unici ≤ 60 char, description uniche 120–160 char su ogni pagina
- [x] JSON-LD: `Organization`/`LocalBusiness` in home, `BreadcrumbList` interne, `CreativeWork` sui progetti
- [x] Un solo `<h1>`, gerarchia titoli senza salti
- [x] `width`/`height` e `alt` su ogni immagine
- [x] `netlify.toml`: header di sicurezza + redirect trailing slash

### Fase 8 — Ottimizzazione
- [x] Preload font, CSS critico inline gestito da Astro
- [x] Nessun JS al client fuori dall'isola form
- [x] Peso pagine sotto controllo

### Fase 9 — Verifiche finali (Definizione di Fatto, 15 check)
- [x] 1 `npm run build` exit 0, zero warning
- [x] 2 `npx astro check` 0 errori 0 warning
- [x] 3 `scripts/check-pages.mjs` tutte le URL della sitemap 200
- [x] 4 404 personalizzata servita
- [x] 5 Lighthouse home mobile ≥ 95/95/95/100
- [x] 6 Lighthouse dettaglio progetto, stesse soglie
- [x] 7 Nessun JS al client tranne il form
- [x] 8 `npx html-validate "dist/**/*.html"` 0 errori
- [x] 9 `npx linkinator dist --recurse` 0 link rotti
- [x] 10 `npm test` tutti verdi
- [x] 10b `grep -in "mailjet" netlify/functions/contact.ts` nessuna corrispondenza
- [x] 11 Schema collection: build fallisce con campo mancante
- [x] 12 Nessun segreto hardcoded
- [x] 13 `npm audit --audit-level=high` pulito
- [x] 14 Responsive 360/768/1280 senza overflow orizzontale
- [x] 15 Nessuna stringa di interfaccia hardcoded
- [x] `RESULTS.md` con output reali

---

## Decisioni prese in autonomia

1. **Scaffold manuale invece di `npm create astro@latest`.** Il proxy di rete della
   sessione blocca `api.github.com` e `codeload.github.com` con 403, e l'installer
   scarica i template da lì: `npm create astro@latest` fallisce con
   «Failed to download … 403 Forbidden». Ho creato a mano la stessa struttura del
   template ufficiale (package.json, tsconfig che estende `astro/tsconfigs/strict`,
   astro.config.mjs, src/pages) installando `astro` dal registry npm, che è
   raggiungibile. Versione: quella che npm ha scaricato, non fissata a memoria.
   Alternativa scartata: fissare una versione di Astro a memoria — vietato dal brief.

2. **Font presi dai pacchetti npm `@fontsource`.** Non potendo scaricare da
   fonts.google.com, ho installato `@fontsource/inter` e `@fontsource/source-serif-4`
   in una cartella temporanea fuori dal progetto, copiato i soli file `.woff2` del
   sottoinsieme latino in `public/fonts/` insieme alle licenze SIL OFL, e disinstallato
   i pacchetti. Nel progetto non resta nessuna dipendenza.
   Alternativa scartata: font di sistema — avrebbe reso il sito visivamente diverso su
   ogni macchina.

3. **`build.format` predefinito (`directory`) con `trailingSlash: 'never'`.** Gli URL
   pubblicati restano senza slash finale come richiesto; il formato a cartelle è quello
   che i server statici (Netlify, anteprima Astro, linkinator) risolvono senza
   configurazione aggiuntiva. Alternativa scartata: `format: 'file'`, che avrebbe
   richiesto la riscrittura degli URL puliti a ogni verifica.

4. **`build.inlineStylesheets: 'never'`.** Serve per poter dichiarare una CSP con
   `style-src 'self'` senza `'unsafe-inline'`. Per la stessa ragione ho tolto l'unico
   attributo `style` inline del progetto (nel logo), sostituito da una classe.
   Alternativa scartata: CSP con `'unsafe-inline'` sugli stili — indebolisce l'header
   di sicurezza richiesto.

5. **Titolo delle pagine di dettaglio progetto senza suffisso di marca.** Il vincolo
   «title unico, max 60 caratteri» non lascia spazio per «… | Brambilla Future» dopo un
   titolo di progetto reale. Il titolo del progetto è già unico. `src/lib/seo.ts`
   interrompe la build se un titolo supera i 60 caratteri o se una meta description esce
   dall'intervallo 120–160. Alternativa scartata: troncare il titolo con i puntini.

6. **Il token antispam viene verificato solo quando è presente.** Cloudflare Turnstile
   è un widget JavaScript: senza JavaScript il token non può esistere, quindi
   pretenderlo sempre renderebbe impossibile il fallback `<form method="POST">`, che il
   brief richiede esplicitamente. Compromesso adottato: se il token c'è viene verificato
   e, se non è valido, la richiesta è respinta con 403; se non c'è, la richiesta passa
   ma il limite di frequenza per IP scende da 5 a 1 invio ogni 15 minuti, oltre a
   honeypot e validazione. È il punto in cui i due requisiti si contraddicono e la
   scelta è documentata anche nel README.
   Alternativa scartata: rifiutare le richieste senza token — avrebbe rotto il fallback.

7. **La fabbrica `creaMailer()` sta in `mailer.ts`, non in `contact.ts`.** Il brief
   chiede sia che `contact.ts` non contenga nessuna stringa del fornitore, sia che
   cambiare fornitore costi «una riga di import». L'unico modo per soddisfarli entrambi
   senza aggiungere file alla struttura richiesta è tenere in `mailer.ts` l'interfaccia
   più una singola riga di import marcata «PUNTO DI SOSTITUZIONE». `contact.ts` importa
   solo dall'interfaccia. Alternativa scartata: un terzo file `mailer-attivo.ts`, fuori
   dalla struttura di cartelle richiesta.

8. **Nomi generici per le chiavi del mailer.** L'adattatore legge `MAILER_API_KEY` e
   `MAILER_API_SECRET`, accettando come ricaduta i nomi storici del fornitore. Così un
   cambio di servizio non obbliga a rinominare le variabili su tutti gli ambienti.

9. **Pagina `/contatti/errore`.** Il brief prevede la pagina di conferma per il
   fallback senza JavaScript, ma non dice dove finisce un invio fallito senza
   JavaScript. Ho aggiunto una pagina gemella, in `noindex` ed esclusa dalla sitemap,
   che spiega i motivi possibili e mostra l'indirizzo email in chiaro.
   Alternativa scartata: rimandare al modulo vuoto, lasciando l'utente senza spiegazione.

10. **Immagini social in PNG.** Le anteprime Open Graph in SVG non sono supportate dai
    social. `scripts/genera-immagini-social.mjs` rasterizza `og-default.png` (1200×630) e
    `apple-touch-icon.png` a partire da SVG scritti a mano, usando `sharp` che è già
    dipendenza di Astro: non aggiunge pacchetti. Tutte le altre immagini del sito sono
    SVG.

11. **Progetti a lunghezza variabile: la variabilità è nel corpo, non nella sintesi.**
    `descrizioneBreve` alimenta anche la meta description, che deve stare fra 120 e 160
    caratteri: non poteva essere «molto corta». Lo stress sul layout è dato dai titoli
    (da 31 a 56 caratteri) e dai corpi Markdown, uno molto lungo
    (`piastra-raffreddamento-pacco-batteria`) e uno molto corto
    (`linea-collaudo-tenuta-serbatoi`).

12. **Il sito vive in un repository suo, separato dall'applicazione preesistente.** Il
    repository di partenza conteneva `index.html`, `dati.json` e `manifest.json` di
    un'applicazione diversa («Conti»), che si aggiorna da sola scrivendo `dati.json` con
    commit automatici su `main`: decine di commit «aggiornamento dati — data e ora». Su
    indicazione del proprietario il sito è stato separato in un repository dedicato, con
    una storia nuova che non contiene nessuno di quei file né quei commit. Così i due
    progetti hanno deploy indipendenti (Netlify per il sito, GitHub Pages per
    l'applicazione) e i salvataggi automatici dell'applicazione non sporcano la storia del
    sito. Alternative scartate: un solo repository con due cartelle — spostare
    `index.html` fuori dalla radice avrebbe rotto l'indirizzo pubblico
    dell'applicazione e il percorso con cui salva `dati.json`; oppure due rami permanenti
    nello stesso repository, che divergono per sempre e condividono un solo GitHub Pages.

13. **`playwright` è l'unica dipendenza di sviluppo aggiunta**, e serve solo al check 14:
    per misurare l'overflow orizzontale e produrre gli screenshot a 360, 768 e 1280 px
    serve un browser vero. Non entra nel sito: `dist/` non contiene nulla che venga da
    lì, e `npm audit --audit-level=high` resta a zero. Gli altri strumenti di verifica
    (`html-validate`, `linkinator`, `lighthouse`) girano con `npx` e non sono dipendenze
    del progetto. Alternativa scartata: screenshot con Chromium da riga di comando, che
    però non permette di valutare l'overflow via DOM.

14. **Lo script del modulo sta in `src/scripts/modulo-contatti.ts` e non dentro il
    componente.** Astro incorporava lo script nella pagina, cosa incompatibile con una
    CSP `script-src 'self'` senza `'unsafe-inline'`. Con `vite.build.assetsInlineLimit: 0`
    Astro lo emette come file esterno di 2,4 kB. Alternativa scartata: mettere l'hash
    dello script nella CSP, che si rompe a ogni modifica del codice.

15. **Privacy policy e cookie policy tenute come dati, non come markup.** Il brief chiede
    contenuti «strutturati in modo che spostarli sia meccanico»: il testo interlacciato ai
    tag non lo è. Sono in `src/lib/testi-legali.ts` come stringhe pure, con segnaposto
    `{email}` e collegamenti nella forma `[testo](/percorso)`, resi da
    `TestoLegale.astro`, che non contiene nessuna stringa. Tradurre significa copiare un
    file e tradurre le stringhe. Alternativa scartata: lasciare il testo nelle pagine.

16. **Il comando Lighthouse del brief non è valido.** `--preset=desktop=false` non esiste
    (`--preset` accetta `desktop`, `perf`, `experimental`). Il profilo mobile è quello
    predefinito, quindi la misura è stata fatta senza `--preset`, verificando nel report
    che `configSettings.formFactor` sia `mobile`.

17. **`linkinator` con `--skip` sul dominio di produzione.** Gli URL assoluti verso
    `https://www.brambillafuture.it` (canonical, `og:image`, JSON-LD) non sono
    risolvibili dalla macchina di build e venivano contati come 63 link rotti con stato 0.
    Sono verificati davvero dal check 3, che li estrae dall'HTML e li riporta sul server
    di anteprima. Alternativa scartata: costruire con `site` puntato a localhost solo per
    la verifica, che avrebbe misurato un artefatto diverso da quello pubblicato.

---

## Versioni installate

| Componente | Versione |
|---|---|
| Node.js | v22.22.2 (LTS attiva, dichiarata in `engines`: `>=22.12.0`) |
| npm | 10.9.7 |
| astro | 7.2.9 |
| @astrojs/sitemap | 3.7.3 |
| @astrojs/check | 0.9.10 |
| typescript | 6.0.3 |

Dipendenze di runtime aggiuntive: **nessuna**. Il progetto ha quattro pacchetti diretti,
tutti ufficiali Astro o TypeScript. `sharp` è usato solo dallo script una tantum delle
immagini social e arriva già come dipendenza di Astro.

| Dipendenza di sviluppo | Versione | Perché |
|---|---|---|
| playwright | 1.62.1 | Solo per il check 14 (overflow e screenshot a 360/768/1280 px). Non finisce in `dist/`. |

Strumenti di verifica eseguiti con `npx`, non installati nel progetto:
lighthouse 13.4.1, html-validate, linkinator.

Font (copiati come file, non come dipendenze): Inter 400/600 e Source Serif 4 600,
sottoinsieme latino, licenza SIL Open Font License 1.1.

---

## Problemi aperti

Nessun check della Definizione di Fatto resta rosso. Restano tre cose che dipendono dal
proprietario e non possono essere chiuse da qui:

1. **I contenuti sono segnaposto.** Realistici e della lunghezza giusta per far emergere i
   problemi di impaginazione, ma inventati. Elenco puntuale di che cosa sostituire nel
   README, sezione «Cosa sostituire prima di andare online».
2. **Privacy policy e cookie policy vanno rilette da chi tratta i dati.** Il testo è
   coerente con quello che il modulo raccoglie davvero, ma è una base, non un parere
   legale: in particolare vanno indicati per nome i fornitori nominati responsabili del
   trattamento.
3. **Il modulo contatti non è mai stato provato contro i servizi veri**, perché le chiavi
   non esistono ancora. La logica è coperta da 14 test con mailer e verifica antispam
   mockati; il primo invio reale va provato subito dopo il deploy, controllando che
   arrivino entrambe le email e che la copia al visitatore non finisca nella posta
   indesiderata.
