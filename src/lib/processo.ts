/**
 * CONTENUTO — Come si svolge un lavoro, dal primo contatto alla consegna.
 *
 * I quattro passi non sono un metodo inventato per far scena: sono le fasi
 * che il cliente ha descritto raccontando come lavora, messe in fila.
 */
export interface Passo {
  titolo: string;
  testo: string;
}

export const processo: Passo[] = [
  {
    titolo: 'Ci raccontate il problema',
    testo:
      'Una telefonata o un sopralluogo. Serve capire due cose: che cosa deve fare il pezzo e con che cosa deve convivere. Il preventivo è gratuito.',
  },
  {
    titolo: 'Progettiamo',
    testo:
      'Modello 3D, tavole di fabbricazione e distinta base. Le scelte importanti le fissiamo insieme prima di disegnare, non dopo.',
  },
  {
    titolo: 'Montiamo',
    testo:
      'In officina da noi o direttamente sulla vostra macchina, a seconda di dove conviene. Stessa sequenza su tutti i pezzi di una serie.',
  },
  {
    titolo: 'Proviamo, poi consegniamo',
    testo:
      'Prova funzionale prima di consegnare, nella sala test quando serve il vuoto. Un problema trovato sul banco costa un decimo di uno trovato in linea.',
  },
];
