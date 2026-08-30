/**
 * CONTENUTO — I cinque servizi dell'attività.
 *
 * SOSTITUIRE PRIMA DI ANDARE ONLINE: titoli, sommari, descrizioni e punti
 * elenco sono segnaposto realistici. Sono contenuti, non stringhe di
 * interfaccia: per tradurre il sito si duplica questo file (es. servizi.en.ts)
 * e lo si seleziona in base alla lingua corrente.
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
    titolo: 'Progettazione e prototipazione',
    sommario:
      'Dal requisito al prototipo funzionante, con il calcolo strutturale fatto in casa e i pezzi lavorati nel nostro reparto.',
    descrizione: [
      "Progettiamo componenti meccanici partendo dai carichi reali, non dai valori di capitolato: dove è possibile misuriamo sul veicolo o sul banco prima di aprire il CAD. È il passaggio che più spesso fa risparmiare massa e passaggi di lavorazione.",
      "Il calcolo strutturale statico e a fatica è interno, così le iterazioni fra disegno e verifica durano ore e non settimane. I prototipi escono dallo stesso reparto CNC che poi produrrà la serie: quello che si prova è già rappresentativo del pezzo definitivo.",
    ],
    punti: [
      'Analisi dei carichi con acquisizione su veicolo o su banco',
      'Modellazione 3D e messa in tavola secondo ISO GPS',
      'Calcolo a elementi finiti statico, a fatica e modale',
      'Ottimizzazione topologica per riduzione di massa',
      'Prototipi lavorati in casa in due settimane',
    ],
  },
  {
    id: 'produzione',
    titolo: 'Produzione di serie e lavorazioni CNC',
    sommario:
      'Quattordici centri di lavoro a tre, quattro e cinque assi per serie da mille a centomila pezzi l\'anno.',
    descrizione: [
      'Produciamo su commessa serie da mille a centomila pezzi l\'anno, in alluminio, acciaio, ghisa e bronzo. Ogni famiglia di prodotto ha attrezzature dedicate: non rimontiamo le macchine fra un lotto e l\'altro, e questo tiene stabile la qualità nel tempo.',
      'Il controllo dimensionale è in linea sui parametri critici e a campione statistico su tutti gli altri. Ogni lotto esce con il proprio certificato, archiviato per quindici anni e richiamabile dal numero di serie inciso sul pezzo.',
    ],
    punti: [
      'Fresatura e tornitura a controllo numerico fino a cinque assi',
      'Attrezzature dedicate per famiglia di prodotto',
      'Controllo in linea con sonda a contatto e correzione utensile',
      'Certificato dimensionale per lotto, archiviato quindici anni',
      'Gestione del conto lavoro per trattamenti e verniciatura',
    ],
  },
  {
    id: 'validazione',
    titolo: 'Validazione e collaudo',
    sommario:
      'Banchi prova progettati e costruiti da noi, campagne a fatica e assistenza alle pratiche di omologazione.',
    descrizione: [
      'Progettiamo e costruiamo banchi prova su misura quando quelli di mercato non riproducono il profilo di missione reale del componente. Il banco resta di proprietà del cliente e viene consegnato con schemi, sorgenti della logica di controllo e formazione del personale.',
      'Sui componenti che produciamo eseguiamo le campagne di qualifica nel nostro laboratorio: prove a fatica, a corrosione, cicli termici e prove di tenuta. I dati grezzi vengono consegnati insieme al rapporto, senza filtri.',
    ],
    punti: [
      'Progettazione e costruzione di banchi prova monoasse e multiasse',
      'Campagne a fatica fino a dieci milioni di cicli',
      'Prove di tenuta a caduta di pressione e con elio',
      'Cicli termici e nebbia salina',
      'Assistenza tecnica alle pratiche di omologazione',
    ],
  },
  {
    id: 'elettrificazione',
    titolo: 'Elettrificazione e retrofit',
    sommario:
      'Conversione di veicoli esistenti a trazione elettrica e componenti meccanici per pacchi batteria.',
    descrizione: [
      'Convertiamo a trazione elettrica veicoli commerciali e da lavoro il cui telaio è ancora a metà della vita utile. Il percorso comprende il progetto del telaio batteria, l\'impianto ad alta tensione, il quadro di bordo e la pratica di omologazione individuale.',
      'Per chi progetta pacchi batteria produciamo la parte meccanica e termica: piastre di raffreddamento brasate, strutture di contenimento, staffe e sistemi di sezionamento. Ogni pezzo destinato al circuito del refrigerante viene provato in tenuta prima di lasciare lo stabilimento.',
    ],
    punti: [
      'Progetto del telaio batteria sul telaio esistente',
      'Impianto ad alta tensione e quadro di bordo',
      'Piastre di raffreddamento in alluminio brasato',
      'Prova di tenuta con elio su ogni pezzo',
      'Formazione dei manutentori e pratica di omologazione individuale',
    ],
  },
  {
    id: 'qualita',
    titolo: 'Qualità e sviluppo fornitori',
    sommario:
      'Affiancamento alle aziende della filiera che devono raggiungere lo standard richiesto da un costruttore.',
    descrizione: [
      'Molte officine della filiera hanno le competenze tecniche ma non la documentazione che un costruttore pretende. Le affianchiamo nel percorso verso IATF 16949: analisi dello scostamento, impianto del sistema documentale, addestramento e accompagnamento fino all\'audit.',
      'Lo stesso metodo lo applichiamo quando un nostro cliente ha un fornitore in difficoltà: andiamo sul posto, misuriamo il processo e concordiamo un piano di rientro con scadenze verificabili.',
    ],
    punti: [
      'Analisi dello scostamento rispetto a IATF 16949',
      'Impianto di PPAP, APQP, FMEA e piani di controllo',
      'Addestramento del personale di reparto e di qualità',
      'Audit di processo di seconda parte presso i fornitori',
      'Piani di rientro con scadenze e indicatori concordati',
    ],
  },
];
