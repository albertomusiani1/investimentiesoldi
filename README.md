# PROJECTUNE — sito vetrina

Sito statico in **Astro** per PROJECTUNE di Matteuzzi Davide, progettazione
meccanica, montaggi e revisioni a Castel Maggiore (BO). Italiano, sobrio, senza
framework CSS e con il JavaScript confinato in tre isole dichiarate.

- **Palette e marchio del cliente**: antracite `#303435` e blu `#3093C9`, i due
  colori del logo, con i file SVG ricavati dal PDF originale (`npm run logo`).
- **CSS puro** con custom properties: chi conosce HTML e CSS può mettere mano ai
  file senza imparare nulla di nuovo.
- **Sezione Lavori che cresce da sola**: si aggiunge un file Markdown, il sito
  fa il resto.
- **Video a schermo intero** in home, con titolo e due chiamate all'azione.
- **Visualizzatore di disegni**: le tavole 2D si ingrandiscono e si trascinano,
  i modelli 3D in STL si ruotano col mouse, col dito o inclinando il telefono.
- **Modulo contatti funzionante** anche senza JavaScript, con doppia email
  (conferma al visitatore, notifica al titolare).

**Quanto JavaScript.** Tre isole, 14,6 kB in tutto, ognuna solo sulle pagine
che la usano: il video del hero (solo `/`), il modulo contatti (solo
`/contatti`), il visualizzatore (solo le pagine progetto che hanno disegni).
Tutto il resto del sito — menu, filtro dei progetti, effetti al passaggio del
mouse — è HTML e CSS. `npm run check:js` lo verifica e fallisce se entra uno
script non dichiarato.

> **Non sai da dove cominciare?** Questo file è il manuale operativo: dice *come*
> fare le cose. Se prima vuoi capire *perché* sono fatte così — cos'è un sito
> statico, cosa fanno HTML, CSS e JavaScript, cosa succede fra il tuo computer e
> il browser di un visitatore — parti da [`GUIDA.md`](./GUIDA.md), scritto per
> chi non fa il mestiere.

---

## Indice

1. [Requisiti e avvio](#requisiti-e-avvio)
2. [Comandi disponibili](#comandi-disponibili)
3. [Struttura delle cartelle](#struttura-delle-cartelle)
4. [Come aggiungere un progetto](#come-aggiungere-un-progetto)
5. [Cosa sostituire prima di andare online](#cosa-sostituire-prima-di-andare-online)
6. [Variabili d'ambiente](#variabili-dambiente)
7. [Il marchio](#il-marchio)
8. [I clienti in fondo alla home](#i-clienti-in-fondo-alla-home)
9. [Come funziona il modulo contatti](#come-funziona-il-modulo-contatti)
10. [Come cambiare fornitore di posta](#come-cambiare-fornitore-di-posta)
11. [Come aggiungere l'inglese](#come-aggiungere-linglese)
12. [Deploy su Netlify](#deploy-su-netlify)
13. [Verifiche](#verifiche)

---

## Requisiti e avvio

Serve **Node.js 22.12 o superiore** (la versione è dichiarata in `package.json`
sotto `engines`).

```bash
npm install       # installa le dipendenze
npm run dev       # sito in sviluppo su http://localhost:4321
```

Per il modulo contatti in locale copiare `.env.example` in `.env` e riempirlo con
le proprie chiavi. Senza `.env` il sito si costruisce e si naviga lo stesso: solo
l'invio del modulo non funziona.

---

## Comandi disponibili

| Comando | Che cosa fa |
|---|---|
| `npm run dev` | Server di sviluppo con ricarica automatica |
| `npm run build` | Costruisce il sito in `dist/` |
| `npm run preview` | Serve `dist/` come lo farebbe il server di produzione |
| `npm run check` | Controllo TypeScript di pagine, componenti e funzioni |
| `npm test` | Test del modulo contatti (non serve nessuna chiave) |
| `npm run check:pages` | Tutte le URL della sitemap rispondono 200 e la 404 è quella del sito |
| `npm run check:i18n` | Nessuna stringa di interfaccia scritta a mano nei componenti |
| `npm run check:js` | Nessuno script fuori dalle tre isole dichiarate |
| `npm run check:responsive` | Screenshot a 360, 768 e 1280 px e controllo overflow |
| `npm run check:html` | Validazione HTML di `dist/` |
| `npm run check:links` | Nessun collegamento interno rotto |
| `npm run logo` | Ricava gli SVG del marchio e la favicon dal PDF in `brand/` |
| `npm run immagini:social` | Rigenera `og-default.png` e `apple-touch-icon.png` |
| `npm run immagini:progetti` | Rigenera le sei illustrazioni delle schede lavoro |
| `npm run disegni` | Rigenera i disegni e i modelli di esempio |
| `npm run video` | Rigenera il video del hero e i fermi immagine (serve ffmpeg) |

`check:pages`, `check:responsive` e `check:links` vogliono `npm run build` già
fatto; i primi due vogliono anche `npm run preview` in esecuzione in un altro
terminale.

---

## Struttura delle cartelle

```
├── astro.config.mjs          Configurazione: dominio, i18n, sitemap
├── brand/                    Il marchio originale del cliente (PDF vettoriale)
├── netlify.toml              Deploy, redirect e header di sicurezza
├── .env.example              Elenco delle variabili d'ambiente (valori fittizi)
├── netlify/functions/
│   ├── contact.ts            Riceve il modulo: validazione, antispam, invio
│   └── lib/
│       ├── mailer.ts         Interfaccia astratta di invio email
│       └── mailer-mailjet.ts Unica implementazione, sostituibile
├── public/                   File serviti così come sono
│   ├── fonts/                Caratteri self-hosted in WOFF2
│   ├── img/                  Illustrazioni SVG e fermi immagine del hero
│   ├── img/clienti/          Marchi dei clienti (quando arrivano)
│   ├── video/hero.mp4        Il filmato del hero
│   ├── disegni/              Tavole 2D dei progetti (SVG)
│   ├── modelli/              Modelli 3D (STL) e loro anteprime (PNG)
│   ├── favicon.svg  og-default.png  apple-touch-icon.png
├── scripts/                  Script di verifica e di servizio
└── src/
    ├── components/           Pezzi riutilizzabili (header, schede, modulo…)
    ├── content/progetti/     ← UN FILE .md PER PROGETTO
    ├── content.config.ts     Schema dei progetti: fa fallire la build se sbagliato
    ├── i18n/it.json          Tutte le stringhe di interfaccia
    ├── layouts/              Struttura comune delle pagine
    ├── lib/                  Dati dell'azienda, servizi, clienti, testi legali
    ├── marchio/              Gli SVG del logo, prodotti da `npm run logo`
    ├── pages/                Una pagina per file (robots.txt incluso, generato)
    ├── scripts/              Le tre isole JavaScript inviate al browser
    └── styles/global.css     Palette, tipografia, spaziature, componenti
```

---

## Come aggiungere un progetto

1. Creare un file nuovo in `src/content/progetti/`.
   **Il nome del file diventa l'indirizzo della pagina**: `nuova-commessa.md`
   diventa `https://…/progetti/nuova-commessa`. Usare solo lettere minuscole,
   cifre e trattini.
2. Mettere l'immagine in `public/img/progetti/` (SVG o PNG, proporzioni 16:10,
   per esempio 800×500 px).
3. Copiare il modello qui sotto e riempirlo.
4. Salvare e ricostruire (`npm run build`). Il progetto compare da solo nella
   griglia di `/progetti`, nel filtro per categoria e — se `inEvidenza: true` —
   fra i tre progetti in home.

Non serve toccare nessun altro file.

### File di esempio, commentato riga per riga

```markdown
---
# ↓ Fra i due "---" ci sono i dati del progetto. Questa parte è obbligatoria.

# Titolo del progetto. Diventa il titolo della pagina e il titolo nella scheda.
# Massimo 60 caratteri: oltre, la build si ferma e lo dice (limite SEO).
titolo: Collettore di scarico in acciaio inox

# Il committente. Se il nome non è pubblicabile si scrive che tipo di
# azienda è, per esempio: Costruttore di macchine automatiche, settore Pharma
cliente: Officine Barattieri

# Deve essere ESATTAMENTE uno di questi quattro valori:
#   Progettazione · Montaggio · Revisione · Collaudo
# Per aggiungerne uno nuovo si modifica CATEGORIE_PROGETTO in src/content.config.ts
categoria: Montaggio

# Data di chiusura della commessa, sempre nel formato AAAA-MM-GG.
data: 2026-02-10

# Riassunto mostrato nella scheda e usato come descrizione per Google.
# Fra 120 e 160 caratteri. Le virgolette servono se il testo contiene ":".
descrizioneBreve: "Fornitura di 12.000 collettori l'anno, con saldatura orbitale certificata e prova di tenuta su ogni pezzo prima della spedizione."

# Percorso dell'immagine, che parte sempre da "/" (cioè dalla cartella public).
immagine: /img/progetti/collettore-acciaio-inox.svg

# Descrizione dell'immagine per chi non la vede. Obbligatoria, almeno 10 caratteri.
# Va descritto che cosa si vede, non ripetuto il titolo.
immagineAlt: Disegno schematico di un collettore di scarico a quattro condotti convergenti in un unico tubo di uscita.

# true = il progetto compare fra quelli in evidenza in home. Facoltativo (predefinito false).
inEvidenza: false

# Posizione nella griglia, numeri più bassi vengono prima. Facoltativo:
# senza questo campo il progetto si ordina per data, dal più recente.
ordine: 7
---

## La richiesta

Da qui in giù si scrive normalmente. Le righe che iniziano con "##" diventano
titoli di sezione della pagina.

## Come l'abbiamo affrontata

Testo normale. Per un elenco puntato basta iniziare le righe con un trattino:

- primo punto
- secondo punto

## Che cosa resta al cliente

Ultima sezione.
```

### Se qualcosa è sbagliato

La build si ferma con un messaggio che dice **quale file** e **quale campo**. Per
esempio, togliendo `cliente`:

```
[InvalidContentEntryDataError] progetti → nuova-commessa data does not match collection schema.
  cliente: Required
  Location: src/content/progetti/nuova-commessa.md
```

È voluto: meglio accorgersene subito che pubblicare una scheda a metà.

---

## Cosa sostituire prima di andare online

Nomi, telefoni, email, partita IVA, servizi, storia e clienti sono quelli veri
forniti dal cliente. Restano da completare le cose che il cliente non ha ancora
mandato: sono poche e sono tutte elencate qui.

### 0. Le cose che mancano davvero — la lista corta

| Che cosa | Dove si mette |
|---|---|
| **Via e CAP** della sede di Castel Maggiore | `src/lib/azienda.ts`, campi `indirizzo.via` e `indirizzo.cap`, oggi vuoti e segnati `DA COMPLETARE` |
| **Foto dei lavori** (progettazione e montaggi) | `public/img/progetti/`, poi il campo `immagine` nel file `.md` del lavoro |
| **Testi veri dei lavori** | `src/content/progetti/*.md`: le sei schede di oggi sono esempi coerenti con quello che sapete fare, non commesse realmente svolte |
| **Marchi dei clienti** | `public/img/clienti/`, poi il campo `logo` in `src/lib/clienti.ts` (vedi più sotto) |
| **Dominio definitivo** | `astro.config.mjs`, costante `DOMINIO_DEFINITIVO` |
| **Chiavi di posta e antispam** | Variabili d'ambiente su Netlify (vedi più sotto) |

Finché la via non c'è, il sito **non la scrive**: l'indirizzo mostra solo
«Castel Maggiore (BO)» e i dati strutturati per Google omettono la via invece di
inventarla. Stessa cosa per gli orari di apertura, che non sono stati forniti e
quindi non compaiono.

### 1. Dati dell'azienda — `src/lib/azienda.ts`

È il file più importante: footer, pagina contatti, privacy policy e dati
strutturati per Google leggono tutti da qui.

| Campo | Che cosa contiene |
|---|---|
| `nome`, `nomeLegale` | Nome commerciale e ragione sociale |
| `descrizioneBreve` | Una riga su che cosa fa l'azienda |
| `fondazione` | Anno di fondazione |
| `email` | Indirizzo di posta |
| `referenti[]` | Le persone con il loro numero diretto: nome, ruolo, telefono |
| `telefono` | Con **spazi unificatori** (U+00A0), non spazi normali: il numero non deve andare a capo |
| `telefonoLink` | Lo stesso numero senza spazi, per il link «chiama» |
| `indirizzo.*` | Via, CAP, città, provincia |
| `superficieOfficina` | Metri quadri dell'officina |
| `datiSocietari` | Partita IVA |
| `dipendenti` | Numero di persone |

### 2. Dominio — un punto solo

| File | Che cosa cambiare |
|---|---|
| `astro.config.mjs` | `DOMINIO_DEFINITIVO`: da `https://www.projectune.it` (segnaposto) al dominio vero |

Il `robots.txt` e la sitemap si allineano da soli: sono generati alla build a
partire dall'indirizzo del sito, non scritti a mano. Su Netlify non serve
nemmeno toccare `DOMINIO_DEFINITIVO` per un deploy di prova: la configurazione
legge la variabile `URL` che Netlify valorizza da sola con l'indirizzo del sito.

L'ordine di precedenza è: variabile `SITE_URL` se la imposti tu → variabile
`URL` di Netlify → `DOMINIO_DEFINITIVO`.

### 3. Testi delle pagine

| File | Contenuto |
|---|---|
| `src/i18n/it.json` | Tutte le etichette, i titoli di sezione, i messaggi del modulo, i titoli e le descrizioni per Google |
| `src/lib/servizi.ts` | I quattro servizi: titolo, sommario, descrizione estesa, elenco «che cosa comprende» |
| `src/lib/clienti.ts` | Le aziende mostrate in fondo alla home |
| `src/lib/testi-legali.ts` | Privacy policy e cookie policy — **da far verificare a chi tratta i dati** |
| `src/pages/chi-siamo.astro` | Storia, credo, persone, officina (blocchi `storia`, `valori`, `persone`, `officina` in cima al file) |
| `src/pages/index.astro` | Le quattro cifre della sezione «in cifre» (blocco `numeri` in cima al file) |
| `src/content/progetti/*.md` | Le sei schede lavoro di esempio: sostituirle con commesse vere, e con le loro tavole e modelli veri nel campo `disegni` |

Ogni blocco da sostituire è marcato nel codice con il commento
`CONTENUTO — SOSTITUIRE`.

### 4. Immagini — `public/img/` e `public/`

Sono tutte SVG geometriche, nella palette del marchio.

| File | Che cos'è |
|---|---|
| `img/mappa-castel-maggiore.svg` | Mappa schematica della pagina contatti (non è una mappa vera: indica la zona, non la via) |
| `img/progetti/*.svg` | Un'immagine per lavoro, generate da `npm run immagini:progetti` |
| `video/hero.mp4` + `img/hero-poster*` | Il filmato del hero e i suoi fermi immagine (vedi la sezione dedicata) |
| `disegni/*.svg`, `modelli/*.stl` + `*.png` | Le tavole e i modelli mostrati nel visualizzatore |
| `favicon.svg` | Icona del sito |
| `og-default.png`, `apple-touch-icon.png` | Generate da `npm run immagini:social`, che le ricava dagli SVG scritti in `scripts/genera-immagini-social.mjs` |

Il `robots.txt` non è un file: lo genera `src/pages/robots.txt.ts` a ogni build,
prendendo l'indirizzo del sito dalla configurazione. Così non può mai puntare a
un dominio sbagliato.

Sostituendo un'immagine va aggiornato anche il testo alternativo: per i progetti
è il campo `immagineAlt`, per le altre la chiave corrispondente in `it.json`.

### 5. Chiavi dei servizi

Vedi la sezione seguente: vanno procurate prima del primo deploy, altrimenti il
modulo contatti risponde con un errore di configurazione.

---

## Variabili d'ambiente

L'elenco completo con valori fittizi è in `.env.example`. **Nessuna chiave sta
nel codice**: sono tutte lette da `process.env` e vanno impostate nel pannello
dell'hosting (su Netlify: *Site configuration → Environment variables*).

| Variabile | A che serve | Dove si ottiene |
|---|---|---|
| `MAILER_API_KEY` | Chiave pubblica del servizio di posta | Pannello del fornitore |
| `MAILER_API_SECRET` | Chiave segreta del servizio di posta | Pannello del fornitore |
| `CONTACT_TO_EMAIL` | Dove arrivano le notifiche | Scelta dell'azienda |
| `CONTACT_FROM_EMAIL` | Mittente delle email; deve essere **verificato** presso il fornitore | Pannello del fornitore |
| `CONTACT_FROM_NAME` | Nome mostrato come mittente | Scelta dell'azienda |
| `TURNSTILE_SECRET_KEY` | Chiave segreta del servizio antispam | dash.cloudflare.com → Turnstile |
| `PUBLIC_TURNSTILE_SITE_KEY` | Chiave pubblica del widget antispam | dash.cloudflare.com → Turnstile |

I nomi `MAILER_*` sono volutamente generici, così cambiare fornitore non obbliga
a rinominare le variabili su tutti gli ambienti. L'adattatore attuale accetta
anche i nomi storici del fornitore come alternativa.

**Se una variabile obbligatoria manca**, la funzione non risponde con un errore
generico: risponde 500 e nei log scrive per nome quale variabile manca.

---

## Il marchio

Il file originale del cliente è `brand/logo-projectune.pdf`: un PDF vettoriale
uscito da Inkscape. Da lì `npm run logo` ricava tre file, **senza ridisegnare
niente a mano**:

| File | Dove si usa |
|---|---|
| `src/marchio/logo-projectune.svg` | Marchio completo: piè di pagina, immagine per i social |
| `src/marchio/logo-projectune-testo.svg` | Solo la scritta: barra in alto |
| `public/favicon.svg` | Icona del browser |

I primi due stanno in `src/` e non in `public/` perché vengono incorporati nella
pagina: così prendono il colore dal CSS (`currentColor`) e non costano una
richiesta di rete.

**Se il cliente manda un marchio aggiornato** basta sostituire il PDF e
rilanciare `npm run logo`. Lo script si ferma con un messaggio chiaro se il
disegno è cambiato di struttura, invece di produrre un file sbagliato in
silenzio.

Nella barra in alto compare la sola scritta e non il marchio completo: il
marchio è alto quanto largo, e alla larghezza di una barra di navigazione la
scritta dentro l'esagono sarebbe alta cinque pixel. Il marchio intero sta nel
piè di pagina, nella favicon e nell'immagine per i social, dove lo spazio c'è.

### I due colori

Sono quelli letti dal PDF: antracite `#303435` e blu `#3093C9`. Stanno in
`src/styles/global.css` come `--marchio-antracite` e `--marchio-blu`, e **non
vanno cambiati**.

C'è però un problema che vale la pena conoscere: il blu del marchio su fondo
bianco raggiunge un contrasto di 3,42:1, sotto il 4,5:1 che serve perché un
testo sia leggibile da tutti (ed è un requisito, non un'opinione: è lo standard
WCAG AA). Per questo il foglio di stile ha tre blu:

| Variabile | Valore | Dove si usa |
|---|---|---|
| `--marchio-blu` | `#3093C9` | Grafica, filetti, bordi, titoli grandi |
| `--colore-accento` | `#1B6E9B` | Testo e bottoni su fondo chiaro (5,6:1) |
| `--colore-accento-chiaro` | `#6FBBE6` | Testo su fondo antracite (5,95:1) |

È lo stesso blu, scurito o schiarito quanto basta. A occhio la differenza non si
nota; a leggerlo, sì.

---

## I clienti in fondo alla home

L'elenco sta in `src/lib/clienti.ts`. Finché un'azienda non manda il proprio
marchio, il sito ne compone il nome nello stile del sito: le targhe hanno tutte
la stessa altezza, quindi la fila resta ordinata anche mentre i marchi arrivano
uno alla volta.

Per aggiungere un marchio:

1. mettere il file in `public/img/clienti/` — SVG, oppure PNG largo almeno
   400 px e con lo sfondo trasparente;
2. aggiungere `logo` e `logoAlt` alla voce corrispondente:

```ts
{
  nome: 'AZ Vacuum',
  logo: '/img/clienti/az-vacuum.svg',
  logoAlt: 'Marchio AZ Vacuum',
},
```

Il campo `sito` è facoltativo e per ora non è usato: serve se un domani si vorrà
rendere i marchi cliccabili.

> **Una raccomandazione, non tecnica.** Il marchio di un'altra azienda si
> pubblica se l'azienda lo manda o dà il via libera. Una riga di email che dice
> «possiamo mettervi fra i nostri clienti sul sito?» evita discussioni dopo.

---

## Come funziona il modulo contatti

1. Il modulo fa `POST` a `/api/contatti`, che `netlify.toml` inoltra alla
   funzione `netlify/functions/contact.ts`.
2. La funzione controlla, **in quest'ordine**:
   - **honeypot** — un campo nascosto via CSS che gli umani non vedono. Se è
     pieno risponde 200 fingendo successo e butta via la richiesta;
   - **limite di frequenza per indirizzo IP** — 5 invii ogni 15 minuti;
   - **validazione dei dati** — campi obbligatori, formato dell'email, lunghezze
     massime, consenso spuntato. Il client non è mai considerato affidabile;
   - **token antispam** — verificato presso Cloudflare Turnstile.
3. Se tutto è a posto invia due email: la notifica al titolare (con
   `Reply-To` impostato sull'indirizzo del visitatore, così si risponde
   direttamente) e la conferma di riepilogo al visitatore.
4. Risponde in JSON alla pagina, che mostra lo stato senza ricaricarsi.

**Senza JavaScript** il modulo funziona lo stesso: il browser esegue una POST
normale e la funzione risponde con un redirect a `/contatti/grazie` in caso di
successo o a `/contatti/errore` in caso contrario.

> **Nota sul compromesso antispam.** Turnstile è un widget JavaScript: senza
> JavaScript il token non può esistere. Pretenderlo sempre renderebbe impossibile
> il funzionamento senza JavaScript, che è un requisito del progetto. Perciò: se
> il token c'è viene verificato e, se non è valido, la richiesta è respinta; se
> non c'è, la richiesta passa ma il limite per quell'IP scende a **1 invio ogni
> 15 minuti**. Per rendere il token obbligatorio basta togliere il controllo
> `if (dati.token !== '')` in `contact.ts`, accettando che il modulo smetta di
> funzionare senza JavaScript.

**Se l'invio della notifica fallisce**, il visitatore riceve un messaggio che lo
invita a scrivere all'indirizzo in chiaro, e il contenuto completo della
richiesta viene scritto nei log della funzione: nessun contatto sparisce in
silenzio.

---

## Come cambiare fornitore di posta

L'invio è isolato dietro un'interfaccia. `contact.ts` **non nomina nessun
fornitore**: importa solo `Mailer` e `creaMailer` da `lib/mailer.ts`.

Per passare, per esempio, a **Resend**:

**1.** Creare `netlify/functions/lib/mailer-resend.ts` con la stessa firma:

```ts
import {
  leggiVariabileObbligatoria,
  type EsitoInvio,
  type Mailer,
  type MessaggioEmail,
} from './mailer.ts';

export function creaMailer(): Mailer {
  return {
    verificaConfigurazione() {
      // Deve lanciare nominando la variabile mancante.
      leggiVariabileObbligatoria('MAILER_API_KEY', 'RESEND_API_KEY');
      leggiVariabileObbligatoria('CONTACT_FROM_EMAIL');
      leggiVariabileObbligatoria('CONTACT_FROM_NAME');
    },

    async inviaEmail(messaggio: MessaggioEmail): Promise<EsitoInvio> {
      const chiave = leggiVariabileObbligatoria('MAILER_API_KEY', 'RESEND_API_KEY');
      const da = `${leggiVariabileObbligatoria('CONTACT_FROM_NAME')} <${leggiVariabileObbligatoria('CONTACT_FROM_EMAIL')}>`;

      try {
        const risposta = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${chiave}`,
          },
          body: JSON.stringify({
            from: da,
            to: [messaggio.to],
            subject: messaggio.subject,
            text: messaggio.text,
            html: messaggio.html,
            ...(messaggio.replyTo ? { reply_to: messaggio.replyTo } : {}),
          }),
          signal: AbortSignal.timeout(10_000),
        });

        if (!risposta.ok) {
          return {
            inviata: false,
            stato: risposta.status,
            errore: `Risposta ${risposta.status}: ${(await risposta.text()).slice(0, 300)}`,
          };
        }

        const dati = (await risposta.json()) as { id?: string };
        return { inviata: true, identificativo: dati.id };
      } catch (errore) {
        return {
          inviata: false,
          errore: errore instanceof Error ? errore.message : String(errore),
        };
      }
    },
  };
}
```

**2.** Cambiare **una riga** in `netlify/functions/lib/mailer.ts`, quella marcata
`PUNTO DI SOSTITUZIONE DEL FORNITORE`:

```diff
- import { creaMailer as creaMailerAttivo } from './mailer-mailjet.ts';
+ import { creaMailer as creaMailerAttivo } from './mailer-resend.ts';
```

**3.** Impostare `MAILER_API_KEY` con la chiave del nuovo servizio (Resend usa
una sola chiave: `MAILER_API_SECRET` non serve più) e verificare il dominio del
mittente presso il nuovo fornitore.

**4.** `npm test` continua a passare senza modifiche: i test lavorano
sull'interfaccia, non sul fornitore.

`contact.ts` non va toccato. Se per cambiare fornitore servisse modificarlo,
l'astrazione sarebbe sbagliata.

---

## Come aggiungere l'inglese

Il sito è predisposto: `astro.config.mjs` ha già la configurazione i18n con
`defaultLocale: 'it'` e `prefixDefaultLocale: false`, quindi gli indirizzi
italiani restano `/servizi` e non diventano `/it/servizi`.

**1.** Aggiungere la lingua alla configurazione, in `astro.config.mjs`:

```diff
  i18n: {
    defaultLocale: 'it',
-   locales: ['it'],
+   locales: ['it', 'en'],
```

**2.** Copiare `src/i18n/it.json` in `src/i18n/en.json` e tradurre i valori
(**le chiavi non si toccano**).

**3.** Registrare il dizionario in `src/i18n/index.ts`:

```diff
  import it from './it.json';
+ import en from './en.json';

- export const locales = ['it'] as const;
+ export const locales = ['it', 'en'] as const;

- const dizionari: Record<Locale, Dizionario> = { it };
+ const dizionari: Record<Locale, Dizionario> = { it, en };
```

TypeScript segnala in fase di build ogni chiave mancante o di troppo nel file
inglese: `npm run check` non passa finché la traduzione non è completa.

**4.** Tradurre i contenuti, che sono già isolati in file di dati:

| Da copiare e tradurre | In |
|---|---|
| `src/lib/servizi.ts` | `src/lib/servizi.en.ts` |
| `src/lib/testi-legali.ts` | `src/lib/testi-legali.en.ts` |
| `src/content/progetti/*.md` | `src/content/progetti/en/*.md` |

**5.** Creare le pagine inglesi in `src/pages/en/`, che riusano gli stessi
layout e componenti passando `locale="en"` all'helper: i componenti non
contengono nessuna stringa, quindi non vanno duplicati.

**6.** Aggiungere i tag `hreflang` in `src/components/SEO.astro`, uno per
lingua, e togliere il filtro sulla lingua nella sitemap se serve.

Il lavoro è tutto di traduzione: nessun componente va rifattorizzato.

---

## Deploy su Netlify

1. Collegare il repository a Netlify. `netlify.toml` contiene già comando di
   build (`npm run build`), cartella pubblicata (`dist`) e cartella delle
   funzioni (`netlify/functions`).
2. Impostare le variabili d'ambiente elencate sopra.
3. Collegare il dominio. Non serve toccare nessun file: `astro.config.mjs`
   legge la variabile `URL` che Netlify valorizza da sola, e `robots.txt` e
   sitemap si allineano di conseguenza. Aggiorna `DOMINIO_DEFINITIVO` solo per
   far coincidere anche le build fatte fuori da Netlify.
4. `netlify.toml` imposta anche:
   - il blocco dell'indicizzazione, da togliere quando i contenuti sono veri
     (vedi la sezione precedente);
   - gli header di sicurezza (CSP, `X-Frame-Options`, `Referrer-Policy`,
     `Permissions-Policy`, HSTS);
   - la riscrittura di `/api/contatti` verso la funzione del modulo;
   - la cache di un anno per font e file con impronta nel nome.

Se in futuro si aggiunge una risorsa da un dominio terzo (un video, una mappa
interattiva) va aggiunta anche alla `Content-Security-Policy`, altrimenti il
browser la blocca.

---

## Mettere online un sito di prova senza farsi trovare su Google

Il sito è già configurato per stare online **senza** finire nei risultati di
ricerca. Serve finché i contenuti sono segnaposto: ragione sociale, partita IVA,
indirizzo e recapiti sono inventati, e la home li dichiara ai motori come scheda
aziendale (dati strutturati `LocalBusiness`). Un'anagrafica finta indicizzata si
toglie male, perché i motori tengono le pagine in cache per settimane.

Il blocco è in `netlify.toml`, nel blocco marcato **BLOCCO DELL'INDICIZZAZIONE**:
un'intestazione `X-Robots-Tag: noindex, nofollow` su tutte le pagine.

Attenzione a una distinzione che confonde spesso:

| | Che cosa fa | Quando usarlo |
|---|---|---|
| `Disallow` in robots.txt | Vieta di **leggere** la pagina | Pagine che non devono essere nemmeno scaricate |
| `X-Robots-Tag: noindex` | Permette di leggerla, vieta di **pubblicarla** nei risultati | Sito di prova |

Usare `Disallow: /` per nascondere un sito è un errore comune e
controproducente: un motore che non può leggere la pagina non può nemmeno
vedere che gli stai chiedendo di non indicizzarla, e l'indirizzo può comparire
lo stesso nei risultati, solo senza descrizione. Per questo il `robots.txt` di
questo sito lascia passare tutto e il divieto sta nell'intestazione.

**Per aprire il sito a Google**, quando dentro ci sono i dati veri:

1. cancella il blocco `[[headers]]` marcato *BLOCCO DELL'INDICIZZAZIONE* in
   `netlify.toml`;
2. commit e push: Netlify ripubblica da solo;
3. verifica che l'intestazione sia sparita (in Chrome: F12 → scheda *Rete* →
   ricarica → clic sulla prima riga → *Intestazioni risposta*);
4. registra il sito su Google Search Console e invia `sitemap-index.xml`.

## Il video del hero

La home apre con un video a schermo intero, il titolo e due chiamate all'azione.

**Come si comporta.** Senza JavaScript resta il fermo immagine, che è anche
l'elemento che decide la velocità percepita della pagina. Con JavaScript il
video parte quando il hero è in vista e si mette in pausa appena lo si è
scorso via, per non consumare batteria a vuoto. Se il sistema del visitatore
chiede meno animazioni (`prefers-reduced-motion`), il video non parte affatto.
Il filmato è muto, senza traccia audio: non c'è niente da silenziare.

**Sostituirlo con riprese vere.** È l'unica cosa da fare:

1. metti il montaggio in `public/video/hero.mp4` — H.264, muto, pensato per
   girare in ciclo, **sotto il mezzo megabyte** (quello attuale pesa 401 kB per
   8 secondi: un video di riprese reali va compresso di conseguenza);
2. metti un fotogramma rappresentativo in `public/img/hero-poster.jpg` e le sue
   versioni leggere in `public/img/hero-poster-900.webp` e
   `hero-poster-1600.webp`;
3. aggiorna la descrizione in `src/i18n/it.json`, voce
   `home.heroVideoDescrizione`.

**Il video attuale è generato, non filmato.** `npm run video` lo ricostruisce da
zero: è un wireframe di flangia che ruota in proiezione ortografica sopra una
griglia da tavolo da disegno, nei colori del marchio, calcolato in
`scripts/genera-video-hero.mjs`.
Serve `ffmpeg` installato (`FFMPEG=/percorso/ffmpeg npm run video` se non è nel
PATH). Non è una dipendenza del progetto: si esegue una volta e i file prodotti
si committano.

> **Attenzione al contrasto.** Il titolo è testo bianco sopra un filmato. I due
> veli in `.eroe__velo` (uno orizzontale, uno verticale) esistono per garantire
> la leggibilità: con riprese più chiare di quelle attuali va rialzata la loro
> opacità, altrimenti il titolo diventa illeggibile e il punteggio di
> accessibilità crolla.

---

## I disegni dei progetti

Ogni progetto può mostrare in fondo alla sua pagina un elenco di tavole e
modelli. La sezione compare da sola se il progetto ha il campo `disegni`, e
sparisce se non ce l'ha.

**Come funziona il visualizzatore.** La scelta fra i disegni è fatta con dei
radio e una regola CSS: funziona anche senza JavaScript. Senza JavaScript ogni
disegno mostra la propria immagine statica più il collegamento per scaricare il
file originale. Con JavaScript:

- le **tavole 2D** si trascinano e si ingrandiscono, con la rotellina che
  ingrandisce nel punto del puntatore e il pizzico a due dita sul telefono;
- i **modelli 3D** si ruotano trascinando, col dito, con le frecce della
  tastiera o **inclinando il telefono** (su iOS il permesso va concesso col
  pulsante «Inclina il telefono»). Si passa fra vista piena e filo di ferro,
  e la rotazione automatica si ferma appena si tocca il modello.

### Aggiungere una tavola 2D

1. Esporta la tavola dal CAD in **SVG** (meglio) o PNG e mettila in
   `public/disegni/`.
2. Aggiungi la voce al progetto:

```yaml
disegni:
  - titolo: Sede pistone — sezione A-A
    tipo: disegno2d
    file: /disegni/sede-pistone-sezione.svg
    nota: "Tavola BF-4471-03, revisione C, scala 1:2"
```

### Aggiungere un modello 3D

Il formato è **STL**, quello che esportano tutti i CAD: in SolidWorks, Fusion,
Inventor, Creo, Onshape è *File → Esporta* o *Salva con nome → STL*. Va bene
sia binario sia ASCII; il binario pesa molto meno. Tieni la tolleranza di corda
sui **0,02 mm** e il numero di triangoli **sotto i 20.000**: oltre, il disegno
diventa pesante da scaricare e lento da ruotare sui telefoni.

1. Metti il file in `public/modelli/`.
2. Serve anche un'**anteprima PNG**, che è quello che si vede senza JavaScript e
   mentre il modello si carica. Se non ce l'hai, uno screenshot della vista
   isometrica dal CAD va benissimo.
3. Aggiungi la voce al progetto:

```yaml
disegni:
  - titolo: Puleggia di rinvio del tenditore
    tipo: modello3d
    file: /modelli/puleggia-dentata.stl
    anteprima: /modelli/puleggia-dentata.png
    nota: "Z=24, passo 8 mm — STL esportato dal CAD"
```

Se dimentichi `anteprima` su un modello 3D, `npm run build` si ferma e te lo
dice: è lo schema Zod che lo pretende, perché senza anteprima chi non ha
JavaScript vedrebbe un buco.

**Come sono resi i modelli.** Nessuna libreria 3D. Il file STL viene letto, le
facce ordinate per profondità e dipinte dalla più lontana alla più vicina;
sopra vengono tracciati gli *spigoli vivi* — quelli fra due facce che formano
un angolo netto — e le *sagome*, cioè il contorno delle superfici curve, che
cambia a ogni rotazione. È il motivo per cui il risultato somiglia a un disegno
e non a un rendering.

I quattro disegni di esempio sono generati da `npm run disegni` e sono
inventati: vanno sostituiti con quelli veri del cliente.

---

## Verifiche

```bash
npm run build && npm run check && npm test
npm run preview &            # in un altro terminale
npm run check:pages
npm run check:responsive
npm run check:html
npm run check:links
npm run check:i18n
npm run check:js
```

L'esito dell'ultima esecuzione completa, con l'output reale dei comandi e i
punteggi Lighthouse, è in [`RESULTS.md`](./RESULTS.md).
