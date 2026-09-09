/**
 * CONTENUTO — I quattro servizi dell'attività.
 *
 * Ogni affermazione qui dentro viene da quello che il cliente ci ha detto di
 * saper fare: settori, lavorazioni, attrezzature. Non ci sono numeri di
 * prestazione, percentuali o certificazioni, perché non ne sono stati
 * forniti: aggiungerli richiede prima averli.
 *
 * Sono contenuti, non stringhe di interfaccia: per tradurre il sito si
 * duplica questo file (es. servizi.en.ts) e lo si seleziona in base alla
 * lingua corrente.
 */
export interface Servizio {
  /** Usato come ancora nell'URL: /servizi#<id> */
  id: string;
  titolo: string;
  /** Una riga, per la sintesi in home. */
  sommario: string;
  /** Due o tre paragrafi, per la pagina Servizi. */
  descrizione: string[];
  /** Che cosa comprende il servizio. */
  punti: string[];
}

export const servizi: Servizio[] = [
  {
    id: 'progettazione',
    titolo: 'Progettazione meccanica',
    sommario:
      'Gruppi, attrezzature e macchine automatiche progettate su specifica, con dieci anni di lavoro nel settore farmaceutico alle spalle.',
    descrizione: [
      "La progettazione è il mestiere con cui è nata PROJECTUNE. Dieci anni di macchine automatiche per il farmaceutico, un settore che non perdona la pulizia approssimativa né la documentazione fatta di corsa, e poi l'oleodinamica degli accumulatori e i macchinari per fonderia: tre mondi con vincoli molto diversi, che insegnano a non applicare la stessa soluzione a tutto.",
      'Lavoriamo su specifica del cliente, dal concetto alla messa in tavola. Il modello 3D, i disegni di fabbricazione e la distinta base restano di chi ci ha commissionato il lavoro: sono il suo prodotto, non il nostro.',
      "Quando serve stare vicino alla macchina lavoriamo direttamente in sede dal cliente; quando serve solo il disegno, lo facciamo dal nostro ufficio e ci vediamo alle revisioni.",
    ],
    punti: [
      'Progettazione di gruppi e attrezzature su specifica',
      'Macchine automatiche per il settore farmaceutico',
      'Accumulatori oleodinamici',
      'Macchinari per fonderia',
      'Modellazione 3D, messa in tavola e distinta base',
    ],
  },
  {
    id: 'montaggi',
    titolo: 'Montaggi meccanici',
    sommario:
      'Montaggio di piccole e medie serie per macchine automatiche, dal singolo gruppo alla macchina completa.',
    descrizione: [
      "Montiamo gruppi meccanici di piccola e media serie per costruttori di macchine automatiche, con esperienza maturata soprattutto nel packaging. Un montaggio ben fatto è quello che si riconosce dopo, quando la macchina lavora: giochi rispettati, serraggi controllati, niente forzature per far entrare un pezzo che non entra.",
      "Lavoriamo sia in officina sia presso il cliente, a seconda di dove conviene: portare in casa una serie di gruppi da assemblare oppure andare sul posto quando il montaggio è parte di una macchina già in linea.",
    ],
    punti: [
      'Montaggio di gruppi meccanici in piccola e media serie',
      'Macchine automatiche per il packaging',
      'Montaggio di componenti per accumulatori oleodinamici',
      'Montaggio in officina o direttamente dal cliente',
      'Assemblaggio e prova di macchinari automatici completi',
    ],
  },
  {
    id: 'revisioni',
    titolo: 'Revisione e manutenzione',
    sommario:
      'Pompe idrauliche e pompe per vuoto smontate, revisionate e riprovate prima di tornare in linea.',
    descrizione: [
      'Revisioniamo pompe idrauliche e pompe per vuoto: smontaggio, verifica dello stato di usura, sostituzione delle parti da sostituire e rimontaggio. Prima di consegnare, la pompa viene riprovata: una revisione che non finisce con una prova è una scommessa, non un intervento.',
      "Ci occupiamo anche della manutenzione programmata, quella che si fa quando la macchina è ferma per scelta e non perché si è fermata da sola.",
    ],
    punti: [
      'Revisione di pompe idrauliche',
      'Revisione di pompe per vuoto',
      'Manutenzione programmata su macchine in servizio',
      'Prova funzionale prima della riconsegna',
      'Interventi in officina o presso il cliente',
    ],
  },
  {
    id: 'prove',
    titolo: 'Prove e collaudo',
    sommario:
      "Officina di 500 m² con sale di test per il vuoto, per il farmaceutico e l'alimentare.",
    descrizione: [
      "La nostra sede la condividiamo con AZ Vacuum, che è insieme partner e cliente: cinquecento metri quadri di officina attrezzata, con sale di test dedicate al vuoto per il farmaceutico e l'alimentare.",
      "Vuol dire che una macchina o un gruppo possono essere montati e provati nello stesso posto, prima di partire per lo stabilimento di destinazione. È il modo più economico di scoprire un problema: quando il pezzo è ancora sul banco.",
    ],
    punti: [
      'Officina attrezzata di 500 m² a Castel Maggiore',
      "Sale di test per il vuoto, farmaceutico e alimentare",
      'Montaggio e prova di macchinari automatici',
      'Prove funzionali su gruppi e componenti revisionati',
      'Possibilità di seguire la prova insieme al cliente',
    ],
  },
];
