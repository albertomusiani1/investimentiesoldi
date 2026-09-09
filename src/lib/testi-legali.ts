/**
 * CONTENUTO — Testi di privacy policy e cookie policy.
 *
 * SOSTITUIRE E FAR VERIFICARE da chi tratta i dati prima di andare online:
 * è una base coerente con i dati che il modulo contatti raccoglie davvero.
 * Se il sito raccoglierà altro (newsletter, area riservata, statistiche) va
 * integrata.
 *
 * I testi sono stringhe pure: nessun tag HTML. Per tradurre il sito si copia
 * questo file (es. `testi-legali.en.ts`), si traducono le stringhe e si
 * seleziona il file in base alla lingua. Convenzioni:
 *   {email} {nomeLegale} {indirizzo} {partitaIva}  → segnaposto
 *   [testo](/percorso)                                   → collegamento
 */

export interface VoceElenco {
  titolo?: string;
  testo: string;
}

export interface VoceDefinizione {
  termine: string;
  testo: string;
}

export type BloccoLegale =
  | { tipo: 'paragrafo'; testo: string }
  | { tipo: 'elenco'; voci: VoceElenco[] }
  | { tipo: 'definizioni'; voci: VoceDefinizione[] };

export interface SezioneLegale {
  /** Titolo di secondo livello. Stringa vuota per il testo introduttivo. */
  titolo: string;
  blocchi: BloccoLegale[];
}

/** Data di ultimo aggiornamento mostrata in cima alle due pagine. */
export const aggiornamentoLegale = '30 agosto 2026';

export const privacy: SezioneLegale[] = [
  {
    titolo: '',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          "Questa informativa descrive come {nomeLegale} tratta i dati personali di chi visita questo sito e di chi invia una richiesta tramite il modulo contatti, ai sensi degli articoli 13 e 14 del Regolamento (UE) 2016/679 («GDPR»).",
      },
    ],
  },
  {
    titolo: 'Titolare del trattamento',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          'Il titolare del trattamento è {nomeLegale}, {indirizzo}, partita IVA {partitaIva}. Per ogni questione relativa ai dati personali si può scrivere a [{email}](mailto:{email}).',
      },
      {
        tipo: 'paragrafo',
        testo:
          "Non è stato nominato un responsabile della protezione dei dati, non ricorrendo i presupposti dell'articolo 37 del GDPR.",
      },
    ],
  },
  {
    titolo: 'Quali dati raccogliamo',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo: "Il sito raccoglie soltanto i dati che l'utente inserisce nel modulo contatti:",
      },
      {
        tipo: 'elenco',
        voci: [
          { titolo: 'Nome e cognome', testo: 'obbligatorio, per sapere a chi rispondere.' },
          {
            titolo: 'Indirizzo email',
            testo: 'obbligatorio, per inviare la risposta e la copia di riepilogo.',
          },
          { titolo: 'Azienda', testo: 'facoltativo, per inquadrare la richiesta.' },
          {
            titolo: 'Messaggio',
            testo:
              "obbligatorio; l'utente è invitato a non inserirvi dati particolari ai sensi dell'articolo 9 del GDPR.",
          },
          {
            titolo: "Consenso all'informativa",
            testo: 'obbligatorio, registrato con data e ora.',
          },
        ],
      },
      {
        tipo: 'paragrafo',
        testo:
          "Per la sola protezione dal traffico automatico il server registra in memoria temporanea l'indirizzo IP di provenienza della richiesta, per un massimo di quindici minuti e senza associarlo agli altri dati del modulo.",
      },
      {
        tipo: 'paragrafo',
        testo:
          'Il sito non usa cookie analitici, di profilazione o di terze parti a fini pubblicitari. Il dettaglio è nella [cookie policy](/cookie-policy).',
      },
    ],
  },
  {
    titolo: 'Finalità e base giuridica',
    blocchi: [
      {
        tipo: 'definizioni',
        voci: [
          {
            termine: 'Rispondere alla richiesta di contatto',
            testo:
              "Base giuridica: esecuzione di misure precontrattuali su richiesta dell'interessato, articolo 6, paragrafo 1, lettera b) del GDPR.",
          },
          {
            termine: 'Protezione del modulo da invii automatici',
            testo:
              'Base giuridica: legittimo interesse del titolare a mantenere il servizio funzionante e sicuro, articolo 6, paragrafo 1, lettera f) del GDPR.',
          },
          {
            termine: 'Adempimenti di legge e difesa in giudizio',
            testo:
              'Base giuridica: obbligo legale e legittimo interesse, articolo 6, paragrafo 1, lettere c) ed f) del GDPR.',
          },
        ],
      },
    ],
  },
  {
    titolo: 'Per quanto tempo conserviamo i dati',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          "I messaggi ricevuti tramite il modulo sono conservati per ventiquattro mesi dalla data di invio, salvo che dal contatto nasca un rapporto commerciale: in quel caso i dati confluiscono nella documentazione contrattuale e seguono i termini di conservazione previsti dalla legge. L'indirizzo IP usato per la protezione antispam viene cancellato entro quindici minuti.",
      },
    ],
  },
  {
    titolo: 'A chi comunichiamo i dati',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          "I dati non sono diffusi e non sono venduti a terzi. Sono accessibili al personale autorizzato del titolare e ai seguenti fornitori, nominati responsabili del trattamento ai sensi dell'articolo 28 del GDPR:",
      },
      {
        tipo: 'elenco',
        voci: [
          {
            titolo: 'Fornitore di hosting del sito',
            testo: 'pubblicazione delle pagine e registri tecnici del server.',
          },
          {
            titolo: 'Fornitore del servizio di posta transazionale',
            testo: "recapito dell'email di conferma all'utente e della notifica interna.",
          },
          {
            titolo: 'Fornitore del servizio antispam',
            testo:
              'verifica che la richiesta provenga da una persona e non da un programma automatico.',
          },
        ],
      },
      {
        tipo: 'paragrafo',
        testo:
          "L'elenco aggiornato con la ragione sociale dei fornitori è disponibile su richiesta scrivendo a [{email}](mailto:{email}).",
      },
    ],
  },
  {
    titolo: 'Trasferimenti fuori dallo Spazio economico europeo',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          "Alcuni fornitori possono trattare i dati su infrastrutture situate fuori dallo Spazio economico europeo. In quel caso il trasferimento avviene sulla base di una decisione di adeguatezza della Commissione europea oppure delle clausole contrattuali tipo di cui all'articolo 46, paragrafo 2, lettera c) del GDPR.",
      },
    ],
  },
  {
    titolo: "I diritti dell'interessato",
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          "In qualunque momento si può chiedere l'accesso ai propri dati, la rettifica, la cancellazione, la limitazione del trattamento, la portabilità, e opporsi al trattamento fondato sul legittimo interesse (articoli da 15 a 22 del GDPR). Il consenso prestato può essere revocato in ogni momento, senza che ciò pregiudichi la liceità del trattamento svolto in precedenza.",
      },
      {
        tipo: 'paragrafo',
        testo:
          'Le richieste vanno inviate a [{email}](mailto:{email}): rispondiamo entro trenta giorni. Chi ritenga che il trattamento violi il GDPR può proporre reclamo al Garante per la protezione dei dati personali oppure allo Stato in cui risiede.',
      },
    ],
  },
  {
    titolo: 'Natura del conferimento',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          "Il conferimento dei dati contrassegnati come obbligatori nel modulo è necessario per ricevere una risposta: senza di essi la richiesta non può essere elaborata. Il conferimento del campo «Azienda» è facoltativo e la sua omissione non ha conseguenze.",
      },
    ],
  },
  {
    titolo: 'Modifiche a questa informativa',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          "Questa informativa può essere aggiornata per adeguarla a modifiche normative o organizzative. La data di ultimo aggiornamento è indicata in cima alla pagina.",
      },
    ],
  },
];

export const cookie: SezioneLegale[] = [
  {
    titolo: '',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          "Un cookie è un piccolo file di testo che un sito salva sul dispositivo di chi lo visita. Questo sito ne fa un uso minimo: non ci sono cookie di profilazione, non c'è pubblicità comportamentale e non sono installati strumenti di analisi statistica di terze parti. Per questo non compare alcun banner di consenso.",
      },
    ],
  },
  {
    titolo: 'Cookie tecnici',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          "Le pagine del sito sono statiche e non impostano cookie propri. L'unica eccezione riguarda la pagina [Contatti](/contatti): il servizio antispam che protegge il modulo può salvare uno o più cookie tecnici, necessari a distinguere una persona da un programma automatico e a impedire l'invio ripetuto della stessa richiesta.",
      },
      {
        tipo: 'definizioni',
        voci: [
          {
            termine: 'Finalità',
            testo: 'Sicurezza del modulo contatti e prevenzione degli invii automatici.',
          },
          {
            termine: 'Durata',
            testo: 'Da pochi minuti a un massimo di trenta giorni, secondo il cookie.',
          },
          {
            termine: 'Consenso',
            testo:
              "Non richiesto: si tratta di cookie strettamente necessari a erogare un servizio esplicitamente richiesto dall'utente, ai sensi dell'articolo 122 del Codice privacy e delle linee guida del Garante dell'8 luglio 2021.",
          },
        ],
      },
    ],
  },
  {
    titolo: 'Font e immagini',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          'I caratteri tipografici e le immagini sono ospitati sullo stesso dominio del sito. Nessuna risorsa viene richiesta a domini terzi durante la normale navigazione: di conseguenza nessun soggetto esterno può rilevare le pagine visitate.',
      },
    ],
  },
  {
    titolo: 'Come disattivare i cookie',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          "Ogni browser permette di bloccare o cancellare i cookie dalle proprie impostazioni di privacy o sicurezza. Bloccando i cookie tecnici del servizio antispam il modulo contatti potrebbe rifiutare l'invio: in quel caso resta possibile scrivere direttamente a [{email}](mailto:{email}).",
      },
    ],
  },
  {
    titolo: 'Trattamento dei dati personali',
    blocchi: [
      {
        tipo: 'paragrafo',
        testo:
          'Le informazioni su quali dati raccogliamo, per quali finalità e per quanto tempo li conserviamo sono nella [privacy policy](/privacy).',
      },
    ],
  },
];
