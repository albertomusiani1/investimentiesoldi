/**
 * CONTENUTO — Le tappe di un lavoro, raccontate una per una.
 *
 * È il testo della colonna di destra nella pagina Lavori: quello che il
 * menu fisso a sinistra scandisce mentre si scorre. Non è il riassunto in
 * quattro passi che sta in home (`processo.ts`): lì si dice *che cosa*
 * succede, qui *come*, con i dettagli che un committente chiede al
 * telefono.
 *
 * L'ultima tappa non sta qui: è il visualizzatore dei disegni, che è un
 * componente e non un testo, e nel menu è la voce in evidenza.
 */
export interface Tappa {
  /** Identificatore usato come ancora, es. "specifica". */
  id: string;
  /** Voce del menu: corta, sta su una riga. */
  voce: string;
  titolo: string;
  testo: string;
  /** Elenco puntato di dettagli concreti. */
  punti: string[];
  /**
   * true sulla tappa che ospita il video. Finché il cliente non manda le
   * riprese resta il segnaposto.
   */
  video?: boolean;
}

export const tappe: Tappa[] = [
  {
    id: 'specifica',
    voce: 'La specifica',
    titolo: 'Prima si capisce, poi si disegna',
    testo:
      'Un lavoro comincia quasi sempre con una macchina che esiste già e un problema che non era previsto. Prima di aprire il CAD serve sapere con che cosa il pezzo dovrà convivere: ingombri, attacchi, cicli, chi lo monterà e con quali attrezzi.',
    punti: [
      'Sopralluogo o rilievo sul posto quando la macchina non si può fermare',
      'Vincoli fissati per iscritto prima di disegnare, non dopo',
      'Preventivo gratuito, con le ore di progettazione separate da quelle di officina',
    ],
  },
  {
    id: 'progetto',
    voce: 'Il progetto',
    titolo: 'Modello 3D, tavole, distinta',
    testo:
      'Il progetto esce completo: modello tridimensionale, tavole di fabbricazione quotate e distinta base con i commerciali già codificati. Chi riceve il pacchetto può mandarlo in officina così com’è.',
    punti: [
      'Tolleranze scelte in funzione della lavorazione, non copiate da un modello precedente',
      'Distinta con i codici dei fornitori che il cliente usa già',
      'Revisioni tracciate: ogni tavola porta la sua data e il suo indice',
    ],
  },
  {
    id: 'officina',
    voce: "L'officina",
    titolo: 'Montaggio, in officina o sulla macchina',
    testo:
      'Cinquecento metri quadri condivisi con AZ Vacuum, con banchi attrezzati e sala test. I gruppi si montano qui quando conviene provarli prima; si montano in sede del cliente quando la macchina non può muoversi.',
    punti: [
      'Stessa sequenza di montaggio su tutti i pezzi di una serie',
      'Coppie di serraggio registrate dove contano',
      'Revisione di pompe idrauliche e per vuoto, smontate e riprovate',
    ],
  },
  {
    id: 'collaudo',
    voce: 'Il collaudo',
    titolo: 'Si prova prima di consegnare',
    testo:
      'Prova funzionale su ogni gruppo che esce, prova di tenuta in sala test quando il lavoro riguarda il vuoto. Un problema trovato sul banco costa un decimo di uno trovato in linea dal cliente finale.',
    punti: [
      'Sala test per il vuoto e per le prove di tenuta',
      'Verbale di prova consegnato insieme al gruppo',
      'Difetti sistemati prima della spedizione, non dopo la contestazione',
    ],
    video: true,
  },
];
