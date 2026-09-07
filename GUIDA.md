# Come funziona questo sito — guida per capirci qualcosa

Questa guida è scritta per chi non fa il mestiere. Non dà per scontato niente:
parte da cos'è un sito web e arriva a come modificare il tuo. Ogni concetto è
ancorato a un file vero di questo progetto, così quando apri una cartella sai
cosa stai guardando.

Si legge dall'inizio alla fine la prima volta. Dopo si usa come manuale: la
[mappa del progetto](#5-la-mappa-del-progetto) e le
[ricette pratiche](#6-ricette-le-modifiche-più-comuni) sono le sezioni a cui
tornerai.

---

## Indice

1. [Che cos'è un sito web, davvero](#1-che-cosè-un-sito-web-davvero)
2. [Statico o dinamico: la scelta che cambia tutto](#2-statico-o-dinamico-la-scelta-che-cambia-tutto)
3. [I tre linguaggi del web](#3-i-tre-linguaggi-del-web)
4. [Perché non ho scritto dieci pagine a mano: Astro](#4-perché-non-ho-scritto-dieci-pagine-a-mano-astro)
5. [La mappa del progetto](#5-la-mappa-del-progetto)
6. [Ricette: le modifiche più comuni](#6-ricette-le-modifiche-più-comuni)
7. [Dal tuo computer al visitatore: il giro completo](#7-dal-tuo-computer-al-visitatore-il-giro-completo)
8. [Il modulo contatti: dove il sito smette di essere statico](#8-il-modulo-contatti-dove-il-sito-smette-di-essere-statico)
9. [Farsi trovare: come funziona davvero il SEO](#9-farsi-trovare-come-funziona-davvero-il-seo)
10. [Accessibilità: non è beneficenza](#10-accessibilità-non-è-beneficenza)
11. [Le verifiche automatiche e perché esistono](#11-le-verifiche-automatiche-e-perché-esistono)
12. [Glossario](#12-glossario)
13. [Cosa imparare dopo](#13-cosa-imparare-dopo)
14. [Rifarlo per un cliente](#14-rifarlo-per-un-cliente)

---

## 1. Che cos'è un sito web, davvero

Togliamo subito la magia. Un sito web è **una cartella di file su un computer
acceso**, e un programma che li spedisce a chi li chiede.

Quando scrivi `brambillafuture.it/servizi` nel browser succede questo:

1. Il browser chiede a un servizio chiamato **DNS** — l'elenco telefonico di
   internet — a quale indirizzo numerico corrisponde `brambillafuture.it`.
   Riceve qualcosa come `75.2.60.5`.
2. Il browser apre una conversazione con quel computer e dice, in sostanza:
   *«mandami la pagina `/servizi`»*. Questa richiesta viaggia in un linguaggio
   che si chiama **HTTP**.
3. Il computer dall'altra parte — il **server** — risponde con un numero e un
   contenuto. Il numero è il famoso codice di stato: `200` vuol dire «eccola»,
   `404` vuol dire «questa pagina non ce l'ho», `500` vuol dire «ho avuto un
   problema io».
4. Il browser riceve un file di testo pieno di tag, lo legge, si accorge che
   servono anche un foglio di stile e dei caratteri tipografici, li richiede
   pure quelli, e **disegna** il risultato sullo schermo.

Tutto qui. Un sito è file + un server che li consegna + un browser che li
interpreta.

> **Prova a vederlo con i tuoi occhi.** Apri il sito, premi `F12` (o tasto destro
> → *Ispeziona*), vai sulla scheda **Rete** e ricarica la pagina. Vedi l'elenco
> di tutte le richieste: la pagina, il CSS, i file dei caratteri, le immagini.
> Ognuna col suo codice di stato e il suo peso. Non c'è nient'altro.

Un dettaglio che conta: la home del tuo sito pesa **circa 104 kB alla prima
visita** — e più della metà è il fermo immagine del video di apertura. Le altre
pagine ne chiedono **una ventina**, perché i caratteri tipografici e il foglio di
stile restano nella memoria del browser. Per riferimento, una singola foto
scattata col telefono pesa venti volte tanto.

---

## 2. Statico o dinamico: la scelta che cambia tutto

Questa è la distinzione più importante di tutta la guida.

### Sito dinamico

Il server **costruisce la pagina nel momento in cui gliela chiedi**. Ogni
visitatore fa partire un programma che interroga un database, mette insieme i
pezzi e produce l'HTML lì per lì. È così che funzionano WordPress, un negozio
online, Facebook.

Serve quando il contenuto **dipende da chi guarda o cambia di continuo**: il
carrello della spesa, il saldo del conto, i commenti appena scritti.

Il prezzo: un computer che gira sempre, un database da mantenere, aggiornamenti
di sicurezza da installare (un WordPress non aggiornato è uno dei modi più comuni
di farsi violare un sito), e più visitatori = più costi.

### Sito statico

Le pagine **esistono già, scritte su disco**, uguali per tutti. Il server non
deve pensare: prende il file e lo spedisce. È il tuo caso.

Quello che ci guadagni:

| | Perché |
|---|---|
| **Velocità** | Non c'è niente da calcolare. La pagina parte subito. |
| **Sicurezza** | Non c'è database da violare né codice da far eseguire al server. La superficie d'attacco è quasi zero. |
| **Costo** | Consegnare file è così economico che i piani gratuiti bastano. |
| **Robustezza** | Non c'è niente che possa «andare giù»: nessun processo, nessuna connessione al database. |

Il limite: se il contenuto deve cambiare, va **ricostruito** il sito. Ma per un
sito vetrina, che cambia quando aggiungi un progetto — cioè poche volte
all'anno — è esattamente lo strumento giusto.

**È il motivo per cui il tuo sito prende 100 su 100 in prestazioni.** Non è
bravura: è che non c'è niente da aspettare.

---

## 3. I tre linguaggi del web

Ogni pagina web al mondo è fatta di tre cose. Metafora: costruire una casa.

### HTML — la struttura (i muri)

Dice **che cosa** sono le cose, non come appaiono. È fatto di *tag*, etichette
fra parentesi angolari che avvolgono il contenuto:

```html
<h1>Contatti</h1>
<p>Scriveteci per una valutazione di fattibilità.</p>
<a href="/servizi">Scopri i servizi</a>
```

`<h1>` è «titolo principale», `<p>` è «paragrafo», `<a>` è «collegamento».

Non è una formalità estetica: usare il tag giusto è ciò che permette a Google di
capire la pagina e a un cieco di navigarla col lettore di schermo. Un titolo
scritto come `<p>` in grassetto **sembra** un titolo, ma per una macchina non lo
è. Nel tuo sito ogni pagina ha esattamente un `<h1>` e i sottotitoli scendono in
ordine (`<h2>`, poi `<h3>`) senza salti: è una delle quindici verifiche
automatiche.

### CSS — l'aspetto (l'intonaco, i colori, i mobili)

Dice **come** devono apparire le cose. Si scrive: «tutti gli elementi di questo
tipo abbiano questo aspetto».

```css
h1 {
  font-size: 2.5rem;
  color: #1d3648;
}
```

Il tuo sito usa **CSS puro**, senza framework. Un framework (Tailwind, Bootstrap)
è una libreria di stili già pronti: fa risparmiare tempo a chi lo conosce già, ma
è un linguaggio in più da imparare, e fra tre anni potrebbe non esistere più. Il
CSS invece è uno standard: quello che c'è scritto oggi funzionerà nel 2040.

Tutto lo stile del sito sta in **un file solo**, `src/styles/global.css`, e i
valori importanti sono raccolti in cima sotto forma di *variabili*:

```css
:root {
  --colore-primario: #1d3648;   /* il blu scuro di titoli e footer */
  --colore-accento:  #8f3d18;   /* il rame dei pulsanti */
  --space-4: 1rem;              /* l'unità base di spaziatura */
}
```

Cambiare `--colore-accento` in un punto solo cambia il colore di tutti i
pulsanti, di tutti i link e di tutti i dettagli del sito. È il senso delle
variabili: **un concetto, un posto**.

### JavaScript — il comportamento (l'impianto elettrico)

È l'unico dei tre che è un vero linguaggio di programmazione: fa succedere cose.
Reagisce ai clic, cambia la pagina senza ricaricarla, parla con altri computer.

Sul tuo sito ce n'è **14,6 kB in tutto, divisi in tre "isole"**, e ogni isola
viene scaricata solo dalla pagina che la usa davvero: il video del hero (solo in
home), il modulo contatti (solo in `/contatti`), il visualizzatore dei disegni
(solo nelle schede progetto). Tutto il resto è HTML e CSS. È una scelta precisa,
non una mancanza — il JavaScript va scaricato, letto ed eseguito dal telefono del
visitatore, e ogni riga costa tempo e batteria. Se un pulsante può funzionare
senza, funziona senza; e infatti anche le tre isole sono facoltative: senza
JavaScript il video resta un'immagine ferma, il modulo si invia ricaricando la
pagina e i disegni si vedono comunque, statici.

> **Il filo conduttore.** Il menu di navigazione, il filtro per categoria nella
> pagina Progetti, gli effetti al passaggio del mouse: tutte cose che di solito
> si fanno in JavaScript, e che qui sono fatte in CSS. Il filtro dei progetti in
> particolare funziona con dei pulsanti radio nascosti e una regola CSS che
> nasconde le schede non selezionate. Zero programmazione.

---

## 4. Perché non ho scritto dieci pagine a mano: Astro

### Il problema

Il tuo sito ha dieci pagine. Tutte hanno la stessa intestazione, lo stesso piè
di pagina, la stessa navigazione. Scritte a mano, quel pezzo di HTML sarebbe
copiato dieci volte.

Il giorno che aggiungi una voce al menu, devi ricordarti di modificarla in dieci
file. Ne dimentichi uno e il sito ha un menu diverso su una pagina. Con sei
progetti, ogni scheda progetto sarebbe un altro copia-incolla.

### La soluzione: un generatore di siti statici

**Astro** è un programma che gira **sul tuo computer**, non su quello del
visitatore. Legge dei file sorgente scritti in modo comodo per te, e ne produce
HTML normale, che è l'unica cosa che il browser sa leggere.

```
   src/            →   [ Astro ]   →      dist/
   (comodo                              (HTML puro,
   per te)                              per il browser)
```

Le due idee che risolvono il problema:

**I componenti.** Un pezzo di pagina riutilizzabile, scritto una volta.
`src/components/Header.astro` contiene l'intestazione. Le dieci pagine la
richiamano con una riga. Cambi il menu lì, cambia ovunque.

**I layout.** Lo scheletro comune. `src/layouts/BaseLayout.astro` dice: «ogni
pagina è fatta da un `<head>`, un link "salta al contenuto", l'intestazione, poi
il contenuto specifico, poi il piè di pagina». Ogni pagina fornisce solo la parte
che cambia.

Un file `.astro` è HTML normale con due poteri in più: può richiamare componenti,
e può contenere piccole porzioni di codice fra parentesi graffe. Questo:

```astro
<h1>{t('contatti.titolo')}</h1>
```

vuol dire: «metti qui il testo che sta nel dizionario alla voce
`contatti.titolo`». Al momento della build diventa `<h1>Contatti</h1>` e la
graffa sparisce. **Nell'HTML finale non resta niente di Astro.**

### Il dizionario dei testi

Nessuna parola visibile è scritta dentro i componenti. Stanno tutte in
`src/i18n/it.json`, un file organizzato per argomento:

```json
{
  "nav":      { "servizi": "Servizi", "contatti": "Contatti" },
  "contatti": { "titolo":  "Contatti" },
  "azioni":   { "invia":   "Invia la richiesta" }
}
```

Due vantaggi concreti. Primo: per cambiare una parola apri un file solo e non
rischi di rompere il codice. Secondo: per fare il sito in inglese si copia questo
file, si traducono i valori a destra e basta — nessun componente va riscritto.
(`i18n` è l'abbreviazione standard di *internationalization*: i-diciotto
lettere-n.)

### Gli altri nomi che vedrai

- **TypeScript** — è JavaScript con i controlli. Ti obbliga a dichiarare che tipo
  di dato è ogni cosa, e ti avvisa *prima* di pubblicare se hai scritto
  `progetto.titollo`. È il motivo per cui `npm run check` esiste.
- **Node.js** — il programma che permette a JavaScript di girare sul tuo computer
  invece che nel browser. Astro gira dentro Node.
- **npm** — il gestore dei pacchetti di Node: scarica le librerie che servono
  (`npm install`) e lancia i comandi del progetto (`npm run build`).
- **Zod** — un controllore di dati. Nel tuo sito controlla che ogni file
  progetto abbia tutti i campi giusti, e ferma la build se manca qualcosa.
- **Markdown** — un modo di scrivere testo formattato senza tag: `## Titolo` per
  un titolo, `- voce` per un elenco. I sei progetti sono scritti così.

---

## 5. La mappa del progetto

Aprendo la cartella vedi molte voci. La regola per orientarsi è una sola:

> **`src/` è quello che scrivi tu. `dist/` è quello che scrive il computer.**
> `dist/` non va mai modificato: viene cancellato e rifatto a ogni build.

```
brambilla-future-sito/
│
├── src/                    ← IL SITO. Qui dentro lavori.
│   ├── pages/                 Una pagina per file: index.astro è la home,
│   │                          servizi.astro è /servizi, e così via.
│   ├── components/            Pezzi riutilizzabili: intestazione, piè di
│   │                          pagina, schede progetto, modulo contatti.
│   ├── layouts/               Lo scheletro comune a tutte le pagine.
│   ├── content/progetti/      UN FILE .md PER PROGETTO. Il posto che userai
│   │                          più spesso.
│   ├── i18n/it.json           Tutte le parole dell'interfaccia.
│   ├── lib/                   I dati: azienda.ts (indirizzo, telefono…),
│   │                          servizi.ts, testi-legali.ts.
│   └── styles/global.css      Colori, caratteri, spaziature: tutto lo stile.
│
├── public/                 ← File copiati così come sono: immagini, caratteri,
│                            video del hero, disegni e modelli 3D.
│
├── netlify/functions/      ← Il pezzo "vivo": riceve il modulo contatti.
│
├── dist/                   ← PRODOTTO DAL COMPUTER. Non toccare.
│
├── astro.config.mjs        ← Configurazione: indirizzo del sito, lingua.
├── netlify.toml            ← Regole di pubblicazione e sicurezza.
├── package.json            ← Elenco dei comandi e delle librerie.
│
├── README.md               ← Manuale operativo: cosa sostituire, come fare le cose.
├── GUIDA.md                ← Questo file: la teoria.
├── PLAN.md                 ← Diario di come è stato costruito e perché.
└── RESULTS.md              ← Esito delle quindici verifiche, con l'output reale.
```

Due cartelle che compariranno e che puoi ignorare: `node_modules/` (le librerie
scaricate, migliaia di file, si rigenera con `npm install`) e `.astro/` (appunti
temporanei di Astro).

---

## 6. Ricette: le modifiche più comuni

**Il ciclo è sempre lo stesso, per qualsiasi modifica:**

```bash
npm run dev     # apri http://localhost:4321 e lascialo acceso
                # modifica un file, salva → il browser si aggiorna da solo
npm run build   # quando sei soddisfatto
git add -A && git commit -m "descrivi cosa hai cambiato" && git push
                # Netlify ripubblica da solo in un paio di minuti
```

`localhost` vuol dire «questo computer»: quel sito lo vedi solo tu.

### Cambiare una parola dell'interfaccia

`src/i18n/it.json`. Cerca il testo, cambia la parte **a destra** dei due punti.
Mai le chiavi a sinistra.

### Cambiare indirizzo, telefono, partita IVA

`src/lib/azienda.ts`. È l'unico posto: da lì passano piè di pagina, pagina
contatti, privacy policy e i dati che legge Google.

Un'attenzione sul telefono: gli spazi lì dentro sono *spazi unificatori*, un
carattere speciale che impedisce al numero di spezzarsi a fine riga. Se lo
riscrivi con spazi normali una verifica te lo segnala.

### Cambiare un colore

`src/styles/global.css`, blocco `:root` in cima. Cambia il valore della
variabile, non le singole regole più sotto.

Attenzione al **contrasto**: testo troppo chiaro su fondo chiaro diventa
illeggibile per chi ha vista debole, e fa scendere il punteggio di accessibilità.
La regola è che testo e sfondo devono avere un rapporto di almeno 4,5 a 1.
Si controlla in due secondi su un sito come *WebAIM Contrast Checker*.

### Aggiungere un progetto

Un file nuovo in `src/content/progetti/`. Il nome del file diventa l'indirizzo
della pagina. Il README ha un modello commentato riga per riga.

Se sbagli qualcosa, `npm run build` si ferma e ti dice **quale file e quale
campo**. È voluto: meglio un errore sul tuo computer che una scheda pubblicata a
metà.

### Cambiare i testi di privacy e cookie policy

`src/lib/testi-legali.ts`. Sono stringhe di testo normale, senza tag. Due sole
convenzioni: `{email}` viene sostituito col vero indirizzo, e
`[testo](/percorso)` diventa un collegamento.

### Aggiungere una pagina nuova

Crea un file in `src/pages/`, per esempio `certificazioni.astro`. Il nome
diventa l'indirizzo: `/certificazioni`. Copia la struttura di una pagina
esistente semplice — `chi-siamo.astro` è un buon modello — e cambia il
contenuto. Ricordati di aggiungere la voce al menu, in
`src/components/Header.astro`.

### Cambiare un'immagine

Le immagini stanno in `public/img/`. Sono file **SVG**: disegni descritti come
istruzioni geometriche («un cerchio qui, di questo colore») invece che come
griglie di pixel. Per questo pesano meno di un kilobyte e restano nitidi a
qualsiasi dimensione.

Puoi sostituirle con delle foto vere (JPG o PNG). Due accortezze: comprimile
prima (uno strumento come *Squoosh* le riduce dell'80% senza differenze
visibili), e aggiorna il **testo alternativo**, cioè la descrizione per chi non
la vede — per i progetti è il campo `immagineAlt`.

---

## 7. Dal tuo computer al visitatore: il giro completo

Cinque tappe. Vale la pena capirle perché quando qualcosa non funziona, il
problema sta sempre in una di queste.

### 1. Scrivi — il tuo computer

Modifichi i file in `src/`. Con `npm run dev` acceso, li vedi cambiare subito nel
browser sul tuo computer. Nessun altro li vede.

### 2. Registri — Git

**Git** è un registratore di modifiche. Fa la fotografia del progetto e la mette
in fila con le precedenti, con una descrizione: si chiama **commit**. Puoi
tornare a qualsiasi fotografia passata.

Non è un backup: è la storia di *perché* le cose sono come sono. Il tuo progetto
ha tre commit, e ognuno spiega cosa cambia e per quale motivo.

### 3. Condividi — GitHub

**GitHub** è un sito che ospita progetti Git. È la copia di riferimento: sta
fuori dal tuo computer, quindi sopravvive se il portatile cade. Con `git push`
mandi lì i tuoi commit.

Git e GitHub sono cose diverse: Git è il programma sul tuo computer, GitHub è il
posto dove lo si tiene in comune. Come «PDF» e «Dropbox».

### 4. Pubblichi — Netlify

**Netlify** guarda il tuo repository su GitHub. Appena arriva un commit nuovo,
in automatico:

1. scarica il progetto;
2. esegue `npm install` e `npm run build`;
3. prende la cartella `dist/` prodotta e la copia sui suoi server sparsi per il
   mondo;
4. da quel momento il sito nuovo è online.

Se la build fallisce — un errore di sintassi, un campo mancante in un progetto —
**Netlify non pubblica niente e lascia online la versione precedente**, avvisandoti
dell'errore. È una rete di sicurezza importante: non puoi mettere online un sito
rotto per sbaglio.

### 5. Guarda — il browser del visitatore

Il visitatore chiede la pagina, Netlify gliela consegna dal server geograficamente
più vicino a lui, il browser la disegna. Torniamo al capitolo 1.

```
  tu scrivi        git commit         git push          in automatico
     ↓                 ↓                  ↓                   ↓
  [ src/ ] ──────► [ Git ] ────────► [ GitHub ] ───────► [ Netlify ]
                 storia locale     copia condivisa      build + pubblica
                                                              │
                                                              ▼
                                                     [ browser del visitatore ]
```

---

## 8. Il modulo contatti: dove il sito smette di essere statico

Un file HTML non può mandare email. L'HTML descrive, non agisce. Serve un
programma che giri su un computer acceso.

Ma abbiamo detto che un sito statico non ha un computer acceso. La soluzione si
chiama **funzione serverless**: un pezzetto di codice che sta fermo e non costa
niente, e **si accende solo quando serve**. Qualcuno invia il modulo, il codice
parte, fa il suo lavoro in mezzo secondo, si spegne. Nessun server da mantenere.

Il nome è fuorviante — un server c'è, ma non è tuo e non ti riguarda.

Il tuo modulo, quando qualcuno preme *Invia*, fa questo:

1. **Honeypot** — «barattolo di miele». C'è un campo nel modulo, invisibile
   grazie al CSS, che una persona non può compilare. I programmi automatici che
   girano per il web riempiendo moduli lo compilano sempre. Se è pieno, il
   sistema risponde «grazie, ricevuto» e butta via tutto senza dirlo. È
   un'esca.
2. **Limite di frequenza** — massimo cinque invii ogni quarto d'ora dallo stesso
   collegamento.
3. **Controllo dei dati** — email valida, messaggio non vuoto, consenso privacy
   spuntato. Questo controllo è rifatto **sul server**, anche se il browser l'ha
   già fatto: un malintenzionato può inviare dati direttamente, saltando la
   pagina. **Regola d'oro: non fidarsi mai di quello che arriva dal browser.**
4. **Verifica antispam** — Cloudflare Turnstile, l'alternativa moderna a «clicca
   sui semafori».
5. **Due email**: il riepilogo a chi ha scritto, la notifica a te.

### Le chiavi e perché non stanno nel codice

Per mandare email serve una password del servizio di posta. Quella password
**non è nel codice**, e non deve esserci mai: il codice sta su GitHub, e chiunque
lo legga leggerebbe anche la password.

Sta invece in una **variabile d'ambiente**: un valore che imposti nel pannello di
Netlify, che il programma legge quando gira, e che non compare da nessuna parte
nei file. Nel progetto c'è `.env.example`, che elenca **i nomi** delle variabili
con valori finti, così sai quali servono senza che i veri finiscano mai in giro.

Una delle quindici verifiche cerca proprio password scritte per sbaglio nel
codice. Non ne trova.

---

## 9. Farsi trovare: come funziona davvero il SEO

**SEO** sta per *Search Engine Optimization*: rendere un sito comprensibile ai
motori di ricerca. Non è un trucco, è buona educazione verso una macchina che
deve capire di cosa parli.

Google manda in giro dei programmi (i *crawler*) che seguono i collegamenti,
scaricano le pagine, le capiscono e le archiviano. Poi, quando qualcuno cerca
qualcosa, pesca dall'archivio.

Le cose che contano, tutte già a posto sul tuo sito:

- **Titolo e descrizione unici per pagina.** Il titolo è la riga blu cliccabile
  nei risultati (massimo 60 caratteri, oltre viene tagliato); la descrizione è
  il testo grigio sotto (fra 120 e 160). Stanno in `src/i18n/it.json`. Il sito
  **si rifiuta di costruirsi** se uno sfora: è un controllo automatico.
- **Un solo `<h1>` per pagina**, e i sottotitoli in ordine. È l'indice del
  documento.
- **Sitemap.** Un file che elenca tutte le pagine, così Google non deve scoprirle
  a tentoni. Si genera da solo a ogni build: `sitemap-index.xml`.
- **robots.txt.** Le istruzioni per i crawler. Anche questo generato
  automaticamente, così non può mai puntare all'indirizzo sbagliato.
- **Indirizzo canonico.** Ogni pagina dichiara qual è il suo indirizzo ufficiale.
  Evita che `/servizi` e `/servizi/` sembrino due pagine diverse col contenuto
  copiato.
- **Dati strutturati (JSON-LD).** Un blocchetto di dati in formato macchina che
  dice esplicitamente «questa è un'azienda, si chiama così, sta qui, apre a
  quest'ora». È quello che alimenta le schede aziendali nei risultati.
- **Anteprime social (Open Graph).** Quando incolli un link su WhatsApp o
  LinkedIn e compare un riquadro con immagine e titolo, sono questi dati.
- **Velocità e telefono.** Google penalizza i siti lenti e quelli che sul
  cellulare non si leggono. Il tuo prende 100 su 100 in entrambi.

### Perché adesso il sito è bloccato

C'è un'intestazione `X-Robots-Tag: noindex, nofollow` che dice ai motori di non
mettere il sito nei risultati. È voluto: dentro ci sono ancora dati inventati —
partita IVA, indirizzo, telefono — e la home li dichiara a Google come scheda
aziendale vera. Un'anagrafica finta indicizzata si toglie male, perché i motori
tengono le pagine in cache per settimane dopo che le hai corrette.

**Una sottigliezza che quasi tutti sbagliano.** Per nascondere un sito la
tentazione è scrivere `Disallow: /` nel robots.txt. È controproducente:
`Disallow` vieta di **leggere** la pagina, e un motore che non la legge non può
nemmeno accorgersi che gli stai chiedendo di non indicizzarla — l'indirizzo può
finire lo stesso nei risultati, solo senza descrizione, che è peggio. La
combinazione corretta è quella che hai: **lettura permessa, indicizzazione
negata**.

Quando i contenuti saranno veri, si toglie un blocco da `netlify.toml` e si
registra il sito su Google Search Console. Ci vogliono comunque giorni o
settimane prima che compaia: è normale.

---

## 10. Accessibilità: non è beneficenza

Accessibilità vuol dire che il sito è usabile anche da chi non vede, non usa il
mouse, non distingue i colori, o semplicemente sta guardando il telefono al sole.

Non è un gesto caritatevole: è un requisito di legge per molti soggetti in
Europa, i motori di ricerca la premiano, e le stesse scelte migliorano il sito
per tutti. Le sottotitolazioni nate per i sordi le usano tutti in metropolitana.

Cosa c'è di concreto nel tuo sito:

- **Ogni immagine ha una descrizione testuale.** Un lettore di schermo la legge
  a voce a chi non vede.
- **Si naviga interamente da tastiera**, col tasto Tab, e c'è sempre un contorno
  ben visibile su dove ti trovi. Molti siti lo tolgono perché «è brutto»: è un
  errore che rende il sito inutilizzabile a chi non può usare il mouse.
- **Un collegamento «Vai al contenuto principale»** in cima, invisibile finché
  non premi Tab. Serve a saltare il menu, che altrimenti un lettore di schermo
  ti rilegge daccapo su ogni pagina.
- **Contrasto verificato** su tutte le combinazioni di colore.
- **Rispetto delle animazioni ridotte.** Chi soffre di vertigini può chiedere al
  sistema operativo di eliminare le animazioni: il sito lo rileva e obbedisce.
- **Il modulo è etichettato bene**: ogni campo ha la sua etichetta collegata, gli
  errori sono annunciati a voce.

Punteggio di accessibilità: 100 su 100. Che non vuol dire perfetto — vuol dire
che non ci sono errori rilevabili da una macchina. Il test vero è provare a
navigare il sito con la sola tastiera.

---

## 11. Le verifiche automatiche e perché esistono

Il progetto ha quindici controlli che si lanciano da riga di comando. L'esito
dell'ultima esecuzione, con l'output vero dei comandi, è in `RESULTS.md`.

L'idea di fondo: **una macchina non si stanca e non si distrae**. Se un controllo
può essere automatico, deve esserlo, perché fra sei mesi ti sarai dimenticato di
farlo a mano.

I più utili nel quotidiano:

| Comando | Cosa ti dice |
|---|---|
| `npm run build` | Il sito si costruisce? Se no, dove sta l'errore |
| `npm run check` | Ci sono errori di programmazione o refusi nei nomi? |
| `npm test` | Il modulo contatti si comporta come deve, in tutti i casi |
| `npm run check:pages` | Tutte le pagine rispondono, la 404 funziona |
| `npm run check:links` | Nessun collegamento interno è rotto |
| `npm run check:responsive` | Nessuna pagina esce dallo schermo, a nessuna dimensione |

Il concetto più importante è quello che gli sviluppatori chiamano *fail fast*:
**meglio un errore rumoroso subito che un problema silenzioso dopo**. Per questo
la build si interrompe se un progetto ha un campo mancante, se un titolo supera i
60 caratteri o se manca una traduzione. Sembra severo, ed è esattamente il punto.

---

## 12. Glossario

| Parola | Che cosa vuol dire |
|---|---|
| **Browser** | Il programma con cui navighi: Chrome, Safari, Firefox |
| **Server** | Un computer sempre acceso che risponde alle richieste |
| **DNS** | L'elenco telefonico che traduce i nomi in indirizzi numerici |
| **HTTP / HTTPS** | Il linguaggio delle richieste web. La S è la versione cifrata |
| **HTML** | Il linguaggio della struttura di una pagina |
| **CSS** | Il linguaggio dell'aspetto |
| **JavaScript** | Il linguaggio del comportamento |
| **Tag** | Un'etichetta HTML, tipo `<p>` |
| **Sito statico** | Pagine già pronte su disco, uguali per tutti |
| **Sito dinamico** | Pagine costruite al momento, diverse per ciascuno |
| **Build** | Il passaggio che trasforma i sorgenti in sito pubblicabile |
| **Deploy** | La pubblicazione online del risultato della build |
| **Astro** | Il generatore che costruisce il sito |
| **Componente** | Un pezzo di pagina riutilizzabile |
| **Layout** | Lo scheletro comune a più pagine |
| **Git** | Il programma che registra la storia delle modifiche |
| **Commit** | Una fotografia del progetto, con descrizione |
| **Repository** | Il progetto con tutta la sua storia |
| **GitHub** | Il sito che ospita i repository |
| **Netlify** | Il servizio che costruisce e pubblica il sito |
| **Serverless** | Codice che si accende solo quando serve |
| **Variabile d'ambiente** | Un valore segreto tenuto fuori dal codice |
| **SEO** | Rendersi comprensibili ai motori di ricerca |
| **Sitemap** | L'elenco delle pagine per i motori |
| **Crawler** | Il programma che i motori mandano a leggere i siti |
| **Canonical** | L'indirizzo ufficiale di una pagina |
| **JSON-LD** | Dati in formato macchina dentro la pagina |
| **Responsive** | Che si adatta a schermi di ogni dimensione |
| **SVG** | Immagine descritta come geometria, non come pixel |
| **Markdown** | Modo semplice di scrivere testo formattato |
| **npm** | Il gestore dei pacchetti e dei comandi del progetto |
| **localhost** | «Questo computer»: il sito che vedi solo tu |

---

## 13. Cosa imparare dopo

In ordine di utilità per te, non di difficoltà.

**Prima cosa, l'unica davvero indispensabile: gli strumenti per sviluppatori del
browser.** Premi `F12` su qualsiasi sito. Scheda *Elementi*: vedi l'HTML e puoi
modificarlo dal vivo — non cambi il sito vero, solo quello che vedi tu, quindi
puoi sperimentare senza paura. Scheda *Rete*: vedi ogni file scaricato, con peso
e tempo. Imparare a leggerli vale più di qualsiasi corso.

**Poi HTML e CSS, in quest'ordine.** Sono le due cose che ti servono davvero per
mettere le mani sul tuo sito. JavaScript può aspettare: il tuo sito quasi non lo
usa.

Due risorse, entrambe gratuite e in italiano:

- **MDN Web Docs** (`developer.mozilla.org`) — la documentazione di riferimento,
  scritta da Mozilla. È il posto dove si va a controllare come funziona una cosa.
- **web.dev** (`web.dev/learn`) — corsi guidati di Google, con capitoli separati
  su HTML, CSS, accessibilità e prestazioni.

**Un consiglio sul metodo.** Non studiare in astratto: apri il tuo sito, cambia
un colore, ricarica, guarda cosa succede. Poi rompi qualcosa apposta e guarda
l'errore. Git ti protegge — con `git checkout .` torni all'ultima versione
salvata e non hai perso niente. È il modo più veloce per imparare, e l'unico che
resta in testa.

---

## 14. Rifarlo per un cliente

> «Se volessi creare un sito per un'azienda esterna simile a questo, potrei farlo
> funzionare così?»

**Sì.** Anzi, è esattamente l'uso per cui un progetto così ha senso: la parte
faticosa — impaginazione, accessibilità, SEO, modulo contatti, verifiche — è già
fatta e non dipende da chi è il cliente. Ma la parte tecnica è la metà facile.
Quella che fa danni, quando il sito è di qualcun altro, è l'altra.

### La parte tecnica: mezza giornata di lavoro, più i contenuti

Il progetto è già un modello riutilizzabile. Su GitHub puoi marcare il
repository come *template* (Settings → spunta «Template repository»): da lì il
pulsante **Use this template** crea una copia nuova, con storia pulita, in due
clic.

Poi cambi **solo i contenuti**, in nove file:

| File | Cosa contiene |
|---|---|
| `src/lib/azienda.ts` | Ragione sociale, indirizzo, telefono, partita IVA, orari |
| `src/i18n/it.json` | Tutte le etichette, i titoli, i testi per Google |
| `src/lib/servizi.ts` | I servizi offerti |
| `src/lib/testi-legali.ts` | Privacy e cookie policy |
| `src/content/progetti/*.md` | I casi da mostrare |
| `src/pages/chi-siamo.astro` | Storia, valori, persone |
| `src/pages/index.astro` | Le cifre della home |
| `src/styles/global.css` | Colori, caratteri, spaziature |
| `astro.config.mjs` | Il dominio |

Più le immagini in `public/img/` e il nome in `package.json`.

**Non tocchi niente** di `src/components/`, `src/layouts/`,
`netlify/functions/`, `scripts/`, `tests/`: è la macchina, e va bene com'è. È il
senso di aver tenuto ogni parola fuori dai componenti.

Realisticamente: mezza giornata per la parte tecnica e il cambio di veste
grafica, più il tempo di scrivere i contenuti veri — che di solito è la cosa che
allunga i tempi, e che dipende dal cliente più che da te.

### Cosa cambia davvero quando il cliente non sei tu

Qui stanno i problemi veri, e nessuno è di programmazione.

**Chi possiede cosa.** È la domanda più importante e quella che si dimentica
sempre. Dominio, repository GitHub, account Netlify, caselle email, chiavi dei
servizi: **intestali al cliente**, e fatti dare accesso come collaboratore.
Costa dieci minuti in più all'inizio ed evita la situazione classica — il
cliente cambia fornitore, o voi vi salutate, e il suo sito è appeso a un account
tuo. Se il dominio è intestato a te, tecnicamente il sito è tuo: è un guaio
legale ed è un pessimo modo di lavorare.

**Chi aggiorna i contenuti.** Un cliente che non usa Git non può aggiungere un
progetto. Hai tre strade, in ordine di sforzo:

1. **Lo fai tu.** Onesto e semplice, se sono due o tre modifiche all'anno. Va
   messo per iscritto: quante, in che tempi, a che condizioni.
2. **Gli insegni l'editor di GitHub.** Poco noto e sorprendentemente efficace:
   `github.com` permette di modificare un file `.md` direttamente dal browser —
   si apre il file, matita in alto a destra, si scrive, *Commit changes*.
   Netlify se ne accorge e ripubblica da solo. Per aggiungere un progetto a un
   sito come questo è più che sufficiente, e non richiede di installare niente.
3. **Aggiungi un CMS.** Esistono pannelli di amministrazione gratuiti che
   scrivono su Git al posto tuo — *Decap CMS*, *Sveltia CMS*, *TinaCMS*: il
   cliente vede un modulo con dei campi, salva, e sotto succede un commit. Sono
   una mezza giornata di configurazione e vanno mantenuti. Ha senso se il sito
   cambia spesso o se le persone che ci scrivono sono più d'una.

**Chi si prende la responsabilità dei testi legali.** La privacy policy non la
scrivi tu, e non la scrive nemmeno un modello: la **verifica il cliente**, che è
il titolare del trattamento e ne risponde. Tu fornisci una base coerente con
quello che il sito raccoglie davvero — come quella che c'è qui — e la fai
rileggere a chi di dovere. Vale lo stesso per i dati societari e per qualunque
affermazione sui prodotti.

**Chi mantiene.** Le librerie invecchiano, Node cambia versione, Netlify
ridisegna l'interfaccia. Un sito così non marcisce in fretta — è statico, non
c'è un WordPress da aggiornare ogni mese — ma una passata di `npm update` e una
build di controllo una o due volte l'anno servono. Decidi in anticipo se è
compreso o se è a chiamata.

### Quanto costa tenerlo in piedi

| Voce | Costo |
|---|---|
| Dominio `.it` | 10–20 € l'anno |
| Netlify, piano gratuito | 0 € — 100 GB di traffico e 300 minuti di build al mese, per un sito vetrina è abbondante |
| Servizio di posta transazionale | 0 € nei piani gratuiti, fino a qualche migliaio di email al mese |
| Antispam | 0 € |

In pratica: **il dominio, e basta**. È uno degli argomenti di vendita più forti
rispetto a un WordPress in hosting condiviso, che parte da qualche decina di
euro l'anno e va aggiornato.

### Quando questo impianto NON è la risposta

Non è adatto a tutto. Se il cliente ti chiede una di queste cose, serve
un'architettura diversa, e conviene dirlo subito:

- **Negozio online.** Carrello, pagamenti, magazzino: servono Shopify o
  WooCommerce, o almeno un servizio di e-commerce agganciato.
- **Area riservata con login.** Richiede un server che sappia chi sei.
- **Prenotazioni, disponibilità in tempo reale.** Idem.
- **Un blog con molti autori e uscite settimanali.** Tecnicamente si fa, ma
  senza un CMS diventa un lavoro per te tutte le settimane.
- **Un cliente che vuole spostare i blocchi da solo**, alla Wix o alla Squarespace.
  Quella libertà qui non c'è: il layout è deciso nel codice. Per certi clienti è
  un pregio — il sito non si imbruttisce da solo — per altri è un limite
  insopportabile. Meglio saperlo prima di firmare.

### Il consiglio pratico

Per il primo cliente, **copia questo progetto e sostituisci i contenuti**. Non
provare a costruirti subito un modello universale: scoprirai solo lavorando sul
secondo e sul terzo sito quali parti cambiano davvero e quali no, e a quel punto
astrarrai le cose giuste invece di quelle che immaginavi.

E tieni la disciplina che c'è già in questo progetto: i contenuti separati dal
codice, le verifiche che girano prima di pubblicare, il `README` che spiega cosa
sostituire. Su un sito tuo sembrano pignolerie. Su un sito di qualcun altro, che
riaprirai fra otto mesi senza ricordarti niente, sono la differenza fra
mezz'ora e mezza giornata.

---

*Questa guida sta in `GUIDA.md`, nel repository, e viene versionata insieme al
codice che descrive: se il sito cambia, la guida si aggiorna qui.*
