# PLAN.md — Sito vetrina PROJECTUNE (progettazione meccanica e montaggi)

Sito statico Astro, italiano, corporate sobrio. CSS puro, zero JS al client tranne
l'isola del form contatti. Collection `progetti` estendibile via file Markdown.

## Stato attuale

- 2026-08-30 09:40 — PLAN.md creato. Nessun codice ancora scritto.
- 2026-08-30 10:05 — Fasi 1–7 completate: setup, design system, layout, tutte le 10 pagine,
  collection con 6 progetti, form contatti con funzione Netlify e 14 test verdi, SEO e
  netlify.toml. Build e `astro check` puliti, check-pages 15/15. Restano le verifiche
  finali (fase 9) e la documentazione (README, RESULTS).
- 2026-09-07 14:55 — **Rifacimento del hero e nuovo visualizzatore di disegni**, su
  richiesta del proprietario. La home apre con un video a schermo intero, titolo in
  carattere display e due chiamate all'azione; le pagine progetto mostrano tavole 2D
  ingrandibili e modelli 3D in STL che si ruotano col mouse, col dito o inclinando il
  telefono. Il vincolo «zero JavaScript tranne il form» è caduto per volontà del
  proprietario: adesso ci sono tre isole dichiarate, 14,6 kB in tutto, verificate da
  `npm run check:js`. Nessun'altra parte del sito è stata toccata. Tutte le verifiche
  rieseguite: Lighthouse 100/100/100/100 su home e su una pagina progetto col
  visualizzatore.
- 2026-09-09 17:05 — **Rifacimento grafico: il sito diventa tecnico, non solo
  sobrio.** Su richiesta del proprietario («troppo semplice»): sistema di elementi
  grafici derivati dall'esagono del marchio — pastiglie, trame a favo, etichette
  monospaziate, squadrature agli angoli — sezioni numerate come un fascicolo
  tecnico, intestazione appiccicosa con emblema, hero con riga di dati e titolo a
  due colori, quattro passi del metodo in esagoni collegati, viewport 3D scuro da
  CAD, comparse allo scorrimento in CSS puro. Il visualizzatore dei disegni, che
  esisteva solo nelle schede lavoro ed era invisibile a chi non ci entrava, ora è
  anche in home come sezione 03, e le schede segnalano con un bollino quali
  lavori hanno tavole o modelli. Nessun JavaScript in più: le isole restano tre,
  14,6 kB. Verifiche rieseguite: Lighthouse 100/100/100/100, responsive 48/48.
- 2026-09-09 16:30 — **Il sito diventa di PROJECTUNE.** Il proprietario ha passato il
  marchio del cliente (PDF vettoriale e biglietto da visita) e il testo di presentazione
  dell'azienda: identità, palette, tipografia e contenuti sono stati rifatti su quelli.
  Antracite `#303435` e blu `#3093C9` letti dal PDF; marchio convertito in SVG da uno
  script, non ridisegnato; titoli passati da un serif editoriale ad Archivo, che sta a un
  marchio geometrico; intestazione e piè di pagina antracite come il biglietto da visita.
  Contenuti veri: due referenti con i loro numeri, i quattro servizi che sanno fare
  davvero, la storia dei due fratelli, l'officina di 500 m² condivisa con AZ Vacuum e la
  fascia dei clienti in fondo alla home. Dove il cliente non ha ancora fornito un dato
  (via della sede, orari) il sito lo omette invece di inventarlo. Tutte le verifiche
  rieseguite: Lighthouse 100/100/100/100, responsive 48/48.
- 2026-09-07 15:05 — Allineata la documentazione ai numeri nuovi: `GUIDA.md` (e la
  sua versione stampabile) diceva ancora «80 kB a pagina» e «2,4 kB di JavaScript su
  una pagina sola». Ora dice 104 kB in home, una ventina sulle altre, 14,6 kB di
  JavaScript in tre isole. Rimossa anche `public/img/hero-officina.svg`, rimasta
  senza riferimenti dopo il nuovo hero.
- 2026-08-30 19:20 — Primo deploy reale su Netlify: la home rispondeva con un ciclo
  di reindirizzamenti. Causa: la regola `from = "/*/"` con `force = true` in
  `netlify.toml`, in cui lo splat può corrispondere alla stringa vuota e quindi la
  radice veniva reindirizzata su se stessa. Regola rimossa; la forma canonica resta
  garantita dal tag `<link rel="canonical">` di ogni pagina.
- 2026-08-30 12:45 — Predisposto il deploy di prova: indirizzo del sito letto
  dall'ambiente (variabile `URL` di Netlify) invece che fissato nel codice,
  `robots.txt` generato alla build così da non poter divergere dall'indirizzo
  reale, e blocco dell'indicizzazione via `X-Robots-Tag` in `netlify.toml`,
  finché i contenuti sono segnaposto. Verifiche rieseguite: tutte verdi.
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

18. **Il vincolo «zero JavaScript» è stato sostituito, non aggirato.** Un video che
    parte e si ferma da sé e un visualizzatore 3D non si fanno senza JavaScript: la
    richiesta del proprietario prevale sul vincolo iniziale. Per non perdere la
    proprietà che rendeva quel vincolo utile, la regola è stata riscritta in una forma
    verificabile — *nessuno script fuori dalle isole dichiarate, e ogni isola solo sulle
    pagine che la usano* — ed è controllata da `scripts/check-js.mjs`, che fallisce se
    entra un file JavaScript estraneo, se una pagina carica un'isola che non le compete
    o se compare uno script scritto dentro l'HTML. Risultato: tre isole, 14,6 kB in
    tutto. Alternativa scartata: lasciare il check come grep manuale, che con tre isole
    non distingue più fra ciò che è previsto e ciò che è entrato per sbaglio.

19. **Il video del hero è generato, non filmato.** Non ho riprese dello stabilimento e
    non potevo scaricarne: `scripts/genera-video-hero.mjs` calcola 200 fotogrammi di un
    wireframe di flangia che ruota in proiezione ortografica su una griglia da tavolo da
    disegno, e li codifica in H.264. 398 kB per 8 secondi, ciclo senza stacco. `ffmpeg`
    non è dipendenza del progetto: lo script si esegue una tantum e i file si committano.
    Alternativa scartata: un filmato di stock, che avrebbe richiesto una licenza e non
    sarebbe stato coerente con la palette.

20. **Solo MP4, niente WebM.** L'H.264 di questo filmato pesa 398 kB contro gli 800 kB
    del VP9 a qualità confrontabile — su contenuto vettoriale piatto x264 è più
    efficiente — ed è supportato da ogni browser in uso. Un secondo formato avrebbe
    aggiunto peso al repository senza servire a nessuno.

21. **Fermo immagine in WebP con `srcset`, JPEG come ricaduta.** È l'elemento più grande
    della pagina e quindi quello che fissa il Largest Contentful Paint. La prima misura
    con il solo JPEG da 74 kB dava Performance 99; passando a WebP (7,6 kB a 900 px) la
    home è tornata a 100. Il video ha perso l'attributo `poster`, che avrebbe scaricato
    una seconda copia dell'immagine in formato diverso.

22. **Terzo carattere, solo per il titolo del hero.** Il vincolo iniziale era due
    caratteri al massimo; «font fighi» richiesti dal proprietario prevalgono. Archivo
    700 (14,5 kB, sottoinsieme latino) è usato **solo** dal titolo del hero, tutto in
    maiuscolo: fuori da lì il sito resta su Inter e Source Serif 4.

23. **Il formato dei modelli 3D è STL.** È quello che esportano tutti i CAD, quindi il
    proprietario può caricare i modelli veri senza conversioni. Il visualizzatore legge
    sia il binario sia l'ASCII e ricalcola sempre le normali, perché quelle scritte nei
    file sono spesso a zero. Alternativa scartata: un formato mio a vertici e spigoli,
    più comodo da disegnare ma impossibile da esportare da un CAD.

24. **Resa 3D con l'algoritmo del pittore, senza WebGL né librerie.** Le facce e gli
    spigoli finiscono in **una sola lista ordinata per profondità**: tenendoli separati
    — prima le facce, poi le linee — gli spigoli del lato nascosto si vedevano
    attraverso il pieno. Ogni triangolo viene anche contornato del proprio colore, per
    chiudere le righe di antialiasing che a occhio sembravano una rigatura sulla
    superficie. Agli spigoli vivi si aggiungono a runtime le **sagome** (dove una faccia
    in vista incontra una faccia girata via): senza di esse il filo di ferro di un
    cilindro sembra spezzato. Misurato: 60 fotogrammi al secondo su un modello da 2 304
    triangoli. Alternativa scartata: WebGL, che avrebbe dato prestazioni superiori ma
    richiesto shader e una ricaduta per i browser senza contesto 3D.

25. **L'altezza dell'intestazione la misura l'isola, non il CSS.** Il hero occupa
    `100svh` meno l'intestazione, ma quell'altezza in CSS non è conoscibile: dipende da
    quante righe occupa il menu, e fra 360 e 768 px cambia in modo non monotono (161,
    119, 141, 89 px). L'isola la misura e la scrive nella variabile CSS; scrivere sulla
    CSSOM non è interessato dalla CSP, che riguarda i fogli e gli attributi `style` nel
    markup. La ricaduta senza JavaScript è volutamente generosa, così se sbaglia il hero
    resta più corto e le due chiamate all'azione restano visibili. Verificato a 360, 480,
    640, 768 e 1280 px.

26. **Il marchio si converte, non si ridisegna.** Il PDF del cliente è vettoriale (esce
    da Inkscape, testo già in tracciati): `scripts/genera-logo.mjs` ne legge il flusso di
    contenuto e ne ricava gli SVG. Rifarlo a mano sarebbe stato più veloce ma avrebbe
    prodotto un marchio *somigliante*; così è lo stesso identico disegno, e se il cliente
    manda una versione nuova basta sostituire il PDF. Lo script si ferma se il numero di
    tracciati cambia, invece di produrre in silenzio un marchio mutilato. Il PDF originale
    resta nel repository, in `brand/`. Alternativa scartata: incollare l'SVG esportato a
    mano una volta e dimenticarsi da dove viene.

27. **Nella barra in alto va la sola scritta del marchio.** Il marchio completo ha
    proporzione 304 × 224: a 190 px di larghezza sarebbe alto 140, cioè il doppio di una
    barra di navigazione, e rimpicciolito a 60 px di altezza avrebbe la scritta alta 5 px.
    Le due alternative erano inventare un blocco orizzontale spostando l'ingranaggio
    accanto alla scritta — cioè modificare il disegno del cliente — oppure usarne una
    parte così com'è. Ho scelto la seconda: la scritta in alto, il marchio intero nel piè
    di pagina, nella favicon e nell'immagine per i social, dove lo spazio c'è.

28. **Tre blu invece di uno.** Il blu del marchio su bianco dà 3,42:1, sotto il 4,5:1
    richiesto per il testo (e 3,68:1 su antracite, sempre sotto). Tenerlo per il testo
    avrebbe rotto un requisito del progetto; cambiarlo avrebbe rotto il marchio. Il foglio
    di stile ha quindi `--marchio-blu` per la grafica e i titoli grandi, `--colore-accento`
    (`#1B6E9B`, 5,6:1) per testo e bottoni su chiaro, `--colore-accento-chiaro`
    (`#6FBBE6`, 5,95:1) per il testo su antracite. È lo stesso blu, scurito o schiarito
    quanto basta: a occhio la differenza non si nota, a leggerlo sì.

29. **Il sito resta chiaro, con l'antracite nelle fasce.** Marchio e biglietto da visita
    sono su fondo scuro, e la tentazione di fare tutto il sito scuro era forte. Ma dieci
    pagine di testo tecnico su fondo scuro si leggono peggio, e il sito ne ha parecchio.
    Compromesso: intestazione, piè di pagina, hero e due fasce interne in antracite, il
    corpo del testo su fondo chiaro. Il rapporto fra i due colori resta quello del
    biglietto da visita.

30. **Il serif editoriale è stato sostituito da Archivo per tutti i titoli.** Source Serif
    stava bene con la vecchia identità, non sta con un marchio geometrico e tecnico. I
    caratteri restano due (Inter per il testo, Archivo per i titoli): un file in meno da
    scaricare rispetto a prima, e le etichette maiuscole riprendono la spaziatura
    larghissima della scritta del logo.

31. **Dove manca un dato, non si inventa: si omette.** Via e CAP della sede non sono stati
    forniti, gli orari nemmeno. Un indirizzo plausibile ma sbagliato finirebbe nei dati
    strutturati e da lì nelle schede di Google, dove correggerlo è molto più difficile che
    non scriverlo. Il sito mostra «Castel Maggiore (BO)», il JSON-LD omette la via, e i
    campi sono segnati `DA COMPLETARE` in `src/lib/azienda.ts`.

32. **I marchi dei clienti non si scaricano da internet.** Il proprietario
    li ha chiesti, ma un logo altrui si pubblica se l'azienda lo manda o dà il consenso.
    `src/lib/clienti.ts` ha il campo `logo` facoltativo: finché è vuoto la targa mostra il
    nome composto nella tipografia del sito, con la stessa altezza delle altre, così la
    fila resta ordinata mentre i marchi arrivano uno alla volta.

33. **Le sei schede lavoro sono esempi coerenti, non commesse reali.** Le vecchie schede
    inventavano nomi di clienti e cifre di risultato: su un sito vero è pubblicità
    ingannevole. Le nuove restano nei mestieri che il cliente ha dichiarato, senza numeri
    di prestazione e senza nomi di committenti non autorizzati (il campo `cliente` dice
    che *tipo* di azienda è). Vanno sostituite quando arrivano le foto e i testi veri.

34. **L'elenco delle pagine del check responsive si ricava da `dist/`.** Era scritto a
    mano e conteneva ancora i vecchi indirizzi dei progetti: le pagine rinominate venivano
    controllate come 404, che ovviamente non hanno overflow, e il check passava verde su
    pagine che non esistevano più. Ora l'elenco si costruisce dai file prodotti: 48
    combinazioni invece di 42, e non può più invecchiare in silenzio.

35. **Un sistema grafico, non una spolverata di decorazioni.** «Più moderno» si
    poteva risolvere con qualche ombra e un gradiente. Ho preferito costruire sei
    elementi riusabili — pastiglia esagonale, trama a favo, etichetta tecnica,
    squadratura, comparsa, collegamento tecnico — definiti una volta in
    `global.css` e applicati con una classe. Costa più CSS (da 33 a 45 kB) ma
    tiene insieme le pagine e rende ovvio come si aggiunge la prossima.

36. **Le trame a favo sono file SVG generati, non `data:` URI incollati nel CSS.**
    Le tessere sono continue per costruzione (il reticolo si ripete ogni
    √3·lato × 3·lato e il viewBox taglia il resto), quindi vanno calcolate:
    `npm run trame`. Un `data:` URI sarebbe stato una riga illeggibile e non
    ricalcolabile; un file si scarica una volta e resta in cache per tutte le
    pagine.

37. **Il monospaziato è quello di sistema.** Le etichette tecniche chiedevano un
    carattere a spaziatura fissa: prenderne uno da scaricare avrebbe aggiunto un
    quarto file solo per le scritte piccole. `ui-monospace` e le sue ricadute
    danno lo stesso effetto a costo zero, e ogni sistema ci mette il suo, che è
    esattamente il tono giusto per un'etichetta da pannello.

38. **Le comparse allo scorrimento sono CSS, non JavaScript.**
    `animation-timeline: view()` fa quello che di solito si fa con un
    IntersectionObserver. Dove il browser non lo supporta il contenuto è già al
    suo posto — nessun blocco invisibile in attesa di uno script, che è il modo
    tipico in cui queste animazioni rompono le pagine. Ed è dentro
    `prefers-reduced-motion: no-preference`.

39. **Il visualizzatore 3D va anche in home.** Era il pezzo più forte del sito ed
    era sepolto in tre schede lavoro su sei: chi arrivava dalla home non sapeva
    che esistesse. Ora la sezione 03 ne mostra uno vero, preso dalla prima scheda
    che ne ha uno invece di duplicarlo, e le schede lavoro segnalano col bollino
    quali portano tavole o modelli. L'isola resta caricata solo dalle pagine che
    la usano, e il modello si scarica solo quando la sezione entra in vista.

40. **Il modello 3D sta in un viewport scuro, le tavole 2D su carta bianca.** Un
    disegno quotato è carta e va guardato come carta; un modello è un oggetto in
    uno spazio, e ogni CAD lo mostra su fondo scuro. Distinguerli aiuta a capire
    che cosa si sta guardando, e in filo di ferro le linee chiare su fondo scuro
    si leggono molto meglio del contrario. Ha richiesto di invertire il colore
    delle linee del filo di ferro e di rifare le anteprime statiche con lo stesso
    fondo, altrimenti si vedeva un lampo bianco prima che partisse l'isola.

41. **L'intestazione resta attaccata in alto.** Su un sito di dieci pagine il
    menu deve essere sempre raggiungibile; senza JavaScript basta
    `position: sticky`. Serviva anche `scroll-padding-top`, altrimenti saltando a
    un'ancora il titolo finisce dietro la barra.

42. **Le sigle dei clienti si calcolano, non si scrivono.** La placca esagonale
    mostra due lettere finché non arriva il marchio vero: si prende il nome
    commerciale (quello prima di «di», che introduce il titolare e non l'azienda),
    si scartano le forme societarie e si tiene la sigla se il nome ne è già una.
    Scriverle a mano avrebbe voluto dire ricordarsi di farlo a ogni cliente nuovo.

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

Caratteri: Inter 400/600 (testo) e **Archivo 700** (titoli e hero), sottoinsieme latino,
licenza SIL Open Font License 1.1. Source Serif 4 è stato rimosso con il cambio di
identità: i file dei caratteri passano da quattro a tre.

`ffmpeg` serve solo a `npm run video` e non è dipendenza del progetto: il video è
committato già codificato.

Strumenti di verifica eseguiti con `npx`, non installati nel progetto:
lighthouse 13.4.1, html-validate, linkinator.

Font (copiati come file, non come dipendenze): Inter 400/600 e Archivo 700, sottoinsieme
latino, licenza SIL Open Font License 1.1.

---

## Problemi aperti

Nessun check della Definizione di Fatto resta rosso. Restano cose che dipendono dal
proprietario e dal cliente, e non possono essere chiuse da qui:

1. **Mancano quattro cose del cliente**, elencate nel README in «Cosa sostituire prima di
   andare online → la lista corta»: via e CAP della sede, le foto dei lavori, i testi veri
   delle commesse, i marchi dei clienti. Nel frattempo il sito omette i dati mancanti
   invece di inventarli, e le sei schede lavoro sono esempi coerenti con i mestieri
   dichiarati, non commesse realmente svolte: vanno confermate o sostituite prima di
   togliere il blocco dell'indicizzazione.
2. **Privacy policy e cookie policy vanno rilette da chi tratta i dati.** Il testo è
   coerente con quello che il modulo raccoglie davvero, ma è una base, non un parere
   legale: in particolare vanno indicati per nome i fornitori nominati responsabili del
   trattamento.
3. **`netlify.toml` non è coperto da nessuna verifica automatica.** Le quindici
   verifiche girano contro `astro preview`, che non legge quel file: redirect e
   intestazioni non vengono mai eseguiti in locale. È il buco da cui è passato il ciclo
   di reindirizzamenti del 30 agosto. Ogni modifica a `netlify.toml` va provata su un
   deploy reale, controllando almeno la home, una pagina interna e `/robots.txt`.
4. **Il modulo contatti non è mai stato provato contro i servizi veri**, perché le chiavi
   non esistono ancora. La logica è coperta da 14 test con mailer e verifica antispam
   mockati; il primo invio reale va provato subito dopo il deploy, controllando che
   arrivino entrambe le email e che la copia al visitatore non finisca nella posta
   indesiderata.
