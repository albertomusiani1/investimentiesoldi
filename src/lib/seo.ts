/**
 * Regole SEO applicate in fase di build.
 *
 * Se un titolo supera i 60 caratteri o una meta description esce
 * dall'intervallo 120–160, la build si interrompe indicando la pagina:
 * meglio un errore in locale che una pagina pubblicata storta.
 */
export const LUNGHEZZA_MAX_TITOLO = 60;
export const LUNGHEZZA_MIN_DESCRIZIONE = 120;
export const LUNGHEZZA_MAX_DESCRIZIONE = 160;

export function validaTitolo(titolo: string, dove: string): string {
  if (titolo.length > LUNGHEZZA_MAX_TITOLO) {
    throw new Error(
      `SEO: il titolo di "${dove}" è di ${titolo.length} caratteri, il massimo è ${LUNGHEZZA_MAX_TITOLO}. Titolo: «${titolo}»`
    );
  }
  return titolo;
}

export function validaDescrizione(descrizione: string, dove: string): string {
  if (
    descrizione.length < LUNGHEZZA_MIN_DESCRIZIONE ||
    descrizione.length > LUNGHEZZA_MAX_DESCRIZIONE
  ) {
    throw new Error(
      `SEO: la meta description di "${dove}" è di ${descrizione.length} caratteri, l'intervallo ammesso è ${LUNGHEZZA_MIN_DESCRIZIONE}–${LUNGHEZZA_MAX_DESCRIZIONE}. Testo: «${descrizione}»`
    );
  }
  return descrizione;
}

/** Tronca al confine di parola più vicino, senza superare il limite. */
function troncaAParola(testo: string, limite: number): string {
  if (testo.length <= limite) return testo;
  const tagliato = testo.slice(0, limite);
  const ultimoSpazio = tagliato.lastIndexOf(' ');
  return (ultimoSpazio > 0 ? tagliato.slice(0, ultimoSpazio) : tagliato).trimEnd();
}

/**
 * Compone la meta description di una pagina di dettaglio: parte dal testo
 * dell'autore e, se è troppo corto, lo completa con il complemento passato.
 */
export function componiDescrizione(base: string, complemento: string, dove: string): string {
  let descrizione = base.trim();

  if (descrizione.length < LUNGHEZZA_MIN_DESCRIZIONE) {
    descrizione = `${descrizione} ${complemento.trim()}`.trim();
  }

  if (descrizione.length > LUNGHEZZA_MAX_DESCRIZIONE) {
    descrizione = `${troncaAParola(descrizione, LUNGHEZZA_MAX_DESCRIZIONE - 1)}…`;
  }

  return validaDescrizione(descrizione, dove);
}
