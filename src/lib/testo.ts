/**
 * Utilità per i testi lunghi tenuti come dati (privacy, cookie policy).
 *
 * I testi sono stringhe semplici, senza markup HTML, così spostarli o
 * tradurli è un'operazione meccanica: si copia il file, si traducono le
 * stringhe, non si tocca nessun tag.
 *
 * Due sole convenzioni dentro le stringhe:
 *   - `{segnaposto}` viene sostituito con un valore (email, indirizzo, …);
 *   - `[testo visibile](/percorso)` diventa un collegamento.
 */

export interface SegmentoTesto {
  testo: string;
  href?: string;
}

/** Sostituisce i segnaposto `{nome}` con i valori passati. */
export function applicaSegnaposto(testo: string, valori: Record<string, string>): string {
  return testo.replace(/\{(\w+)\}/g, (intero, chiave: string) => valori[chiave] ?? intero);
}

/**
 * Divide un testo nei segmenti da rendere: testo semplice e collegamenti.
 * Non interpreta nient'altro: nessun HTML può entrare da qui.
 */
export function segmenta(testo: string): SegmentoTesto[] {
  const segmenti: SegmentoTesto[] = [];
  const espressione = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let posizione = 0;

  for (const corrispondenza of testo.matchAll(espressione)) {
    const indice = corrispondenza.index ?? 0;
    if (indice > posizione) segmenti.push({ testo: testo.slice(posizione, indice) });
    segmenti.push({ testo: corrispondenza[1] ?? '', href: corrispondenza[2] ?? '' });
    posizione = indice + corrispondenza[0].length;
  }

  if (posizione < testo.length) segmenti.push({ testo: testo.slice(posizione) });
  return segmenti;
}
