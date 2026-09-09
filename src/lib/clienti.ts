/**
 * CONTENUTO — Le aziende con cui lavoriamo.
 *
 * I nomi sono quelli forniti dal cliente. I marchi no: un logo altrui si
 * pubblica solo se l'azienda lo manda o dà il consenso, ed è per questo che
 * `logo` è facoltativo. Finché manca, il sito mostra il nome scritto nello
 * stile del sito — una soluzione che sta in piedi da sola e non sembra un
 * buco in attesa di essere tappato.
 *
 * Per aggiungere un marchio:
 *   1. mettere il file in `public/img/clienti/` (SVG, o PNG largo almeno
 *      400 px e con lo sfondo trasparente);
 *   2. scrivere qui `logo` e `logoAlt`.
 */
export interface Cliente {
  /** Ragione sociale come va scritta sul sito. */
  nome: string;
  /** Percorso del marchio, es. /img/clienti/az-vacuum.svg */
  logo?: string;
  /** Testo alternativo del marchio: descrive il marchio, non l'azienda. */
  logoAlt?: string;
  /** Sito dell'azienda, se si vuole collegare il marchio. */
  sito?: string;
}

export const clienti: Cliente[] = [
  { nome: 'AZ Vacuum' },
  { nome: 'Revortex srl' },
  { nome: 'People Design' },
  { nome: 'SL Servizio Lame di Antonio Marchesini' },
  { nome: 'Roscomec di Rossi Fabio' },
  { nome: 'Maunoa srl' },
  { nome: 'Exon Compositi srl' },
];
