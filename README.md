# Brambilla Future — sito vetrina

Sito statico in **Astro** per Brambilla Future, ingegneria e componentistica per
l'automotive. Italiano, corporate, senza framework CSS e senza JavaScript sul
client tranne l'isola del modulo contatti.

- **CSS puro** con custom properties: chi conosce HTML e CSS può mettere mano ai
  file senza imparare nulla di nuovo.
- **Sezione Progetti che cresce da sola**: si aggiunge un file Markdown, il sito
  fa il resto.
- **Modulo contatti funzionante** anche senza JavaScript, con doppia email
  (conferma al visitatore, notifica al titolare).

---

## Indice

1. [Requisiti e avvio](#requisiti-e-avvio)
2. [Comandi disponibili](#comandi-disponibili)
3. [Struttura delle cartelle](#struttura-delle-cartelle)
4. [Come aggiungere un progetto](#come-aggiungere-un-progetto)
5. [Cosa sostituire prima di andare online](#cosa-sostituire-prima-di-andare-online)
6. [Variabili d'ambiente](#variabili-dambiente)
7. [Come funziona il modulo contatti](#come-funziona-il-modulo-contatti)
8. [Come cambiare fornitore di posta](#come-cambiare-fornitore-di-posta)
9. [Come aggiungere l'inglese](#come-aggiungere-linglese)
10. [Deploy su Netlify](#deploy-su-netlify)
11. [Verifiche](#verifiche)

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
| `npm run check:responsive` | Screenshot a 360, 768 e 1280 px e controllo overflow |
| `npm run check:html` | Validazione HTML di `dist/` |
| `npm run check:links` | Nessun collegamento interno rotto |
| `npm run immagini:social` | Rigenera `og-default.png` e `apple-touch-icon.png` |

`check:pages`, `check:responsive` e `check:links` vogliono `npm run build` già
fatto; i primi due vogliono anche `npm run preview` in esecuzione in un altro
terminale.

---

## Struttura delle cartelle

```
├── astro.config.mjs          Configurazione: dominio, i18n, sitemap
├── netlify.toml              Deploy, redirect e header di sicurezza
├── .env.example              Elenco delle variabili d'ambiente (valori fittizi)
├── netlify/functions/
│   ├── contact.ts            Riceve il modulo: validazione, antispam, invio
│   └── lib/
│       ├── mailer.ts         Interfaccia astratta di invio email
│       └── mailer-mailjet.ts Unica implementazione, sostituibile
├── public/                   File serviti così come sono
│   ├── fonts/                Caratteri self-hosted in WOFF2
│   ├── img/                  Illustrazioni SVG
│   ├── favicon.svg  og-default.png  apple-touch-icon.png  robots.txt
├── scripts/                  Script di verifica e di servizio
└── src/
    ├── components/           Pezzi riutilizzabili (header, schede, modulo…)
    ├── content/progetti/     ← UN FILE .md PER PROGETTO
    ├── content.config.ts     Schema dei progetti: fa fallire la build se sbagliato
    ├── i18n/it.json          Tutte le stringhe di interfaccia
    ├── layouts/              Struttura comune delle pagine
    ├── lib/                  Dati dell'azienda, servizi, testi legali, SEO
    ├── pages/                Una pagina per file
    ├── scripts/              L'unico JavaScript inviato al browser
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

# Nome del cliente. Se non è pubblicabile scrivere: Confidenziale
cliente: Officine Barattieri

# Deve essere ESATTAMENTE uno di questi quattro valori:
#   Progettazione · Produzione · Validazione · Elettrificazione
# Per aggiungerne uno nuovo si modifica CATEGORIE_PROGETTO in src/content.config.ts
categoria: Produzione

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

## Il problema

Da qui in giù si scrive normalmente. Le righe che iniziano con "##" diventano
titoli di sezione della pagina.

## Che cosa abbiamo fatto

Testo normale. Per un elenco puntato basta iniziare le righe con un trattino:

- primo punto
- secondo punto

## Il risultato

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

Tutti i contenuti sono segnaposto realistici ma **inventati**. Ecco l'elenco
completo, file per file.

### 1. Dati dell'azienda — `src/lib/azienda.ts`

È il file più importante: footer, pagina contatti, privacy policy e dati
strutturati per Google leggono tutti da qui.

| Campo | Che cosa mettere |
|---|---|
| `nome`, `nomeLegale` | Nome commerciale e ragione sociale |
| `descrizioneBreve` | Una riga su che cosa fa l'azienda |
| `fondazione` | Anno di fondazione |
| `email`, `emailPec` | Indirizzi reali |
| `telefono` | Numero con **spazi unificatori** (U+00A0), non spazi normali |
| `telefonoLink` | Lo stesso numero senza spazi, per il link «chiama» |
| `indirizzo.*` | Via, CAP, città, provincia |
| `coordinate` | Latitudine e longitudine della sede |
| `orari` | Giorni e orari di apertura |
| `datiSocietari` | Partita IVA, REA, capitale sociale |
| `dipendenti` | Numero di persone |

### 2. Dominio — tre punti

| File | Che cosa cambiare |
|---|---|
| `astro.config.mjs` | `SITE_URL`: da `https://www.brambillafuture.it` al dominio vero |
| `public/robots.txt` | La riga `Sitemap:` con lo stesso dominio |
| `netlify.toml` | Niente, se non si aggiungono domini terzi alla CSP |

### 3. Testi delle pagine

| File | Contenuto |
|---|---|
| `src/i18n/it.json` | Tutte le etichette, i titoli di sezione, i messaggi del modulo, i titoli e le descrizioni per Google |
| `src/lib/servizi.ts` | I cinque servizi: titolo, sommario, descrizione estesa, elenco «che cosa comprende» |
| `src/lib/testi-legali.ts` | Privacy policy e cookie policy — **da far verificare a chi tratta i dati** |
| `src/pages/chi-siamo.astro` | Storia, valori, persone, certificazioni (blocchi `storia`, `valori`, `team`, `certificazioni` in cima al file) |
| `src/pages/index.astro` | Le quattro cifre della sezione «in cifre» (blocco `numeri` in cima al file) |
| `src/content/progetti/*.md` | I sei progetti di esempio: sostituirli con commesse vere |

Ogni blocco da sostituire è marcato nel codice con il commento
`CONTENUTO — SOSTITUIRE`.

### 4. Immagini — `public/img/` e `public/`

Sono tutte SVG geometriche disegnate a mano, in palette con il sito.

| File | Che cos'è |
|---|---|
| `img/hero-officina.svg` | Illustrazione della home |
| `img/mappa-seregno.svg` | Mappa statica della pagina contatti (non è una mappa vera) |
| `img/progetti/*.svg` | Un'immagine per progetto |
| `favicon.svg` | Icona del sito |
| `og-default.png`, `apple-touch-icon.png` | Generate da `npm run immagini:social`, che le ricava dagli SVG scritti in `scripts/genera-immagini-social.mjs` |

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
3. Puntare il dominio e aggiornare `SITE_URL` in `astro.config.mjs` e
   `public/robots.txt`.
4. `netlify.toml` imposta anche:
   - gli header di sicurezza (CSP, `X-Frame-Options`, `Referrer-Policy`,
     `Permissions-Policy`, HSTS);
   - il redirect permanente dagli indirizzi con slash finale a quelli senza, per
     non avere contenuti duplicati;
   - la cache di un anno per font e file con impronta nel nome.

Se in futuro si aggiunge una risorsa da un dominio terzo (un video, una mappa
interattiva) va aggiunta anche alla `Content-Security-Policy`, altrimenti il
browser la blocca.

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
```

L'esito dell'ultima esecuzione completa, con l'output reale dei comandi e i
punteggi Lighthouse, è in [`RESULTS.md`](./RESULTS.md).
