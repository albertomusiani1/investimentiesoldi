/**
 * Quale linea grafica usare.
 *
 * Il sito ha due vestiti sullo stesso corpo: la struttura, i contenuti e i
 * componenti sono identici, cambia solo il foglio di stile del tema.
 *
 *   tema 1 — «officina»: fondo scuro metallico, il vestito di serie.
 *   tema 2 — «tavola»:   il sito disegnato su un foglio da disegno tecnico,
 *                        con le quote finte intorno agli elementi.
 *
 * Come si cambia: una variabile d'ambiente, letta al momento della
 * costruzione del sito. Non c'è nessun interruttore nel browser e nessuna
 * pagina doppia.
 *
 *   npm run build          → tema 1
 *   npm run build:tema2    → tema 2
 *
 * Come se ne aggiunge un terzo: si scrive `public/temi/tema-3.css` con le
 * regole dentro `[data-tema='3']`, si aggiunge '3' all'elenco qui sotto e si
 * copia lo script in package.json. Il collegamento al foglio lo mette da sé
 * BaseLayout. Nient'altro: nessun componente da duplicare.
 */
export const TEMI = ['1', '2'] as const;

export type Tema = (typeof TEMI)[number];

const richiesto = import.meta.env['PUBLIC_TEMA'];

/**
 * Un valore sconosciuto non fa cadere la costruzione del sito: si torna al
 * tema di serie e lo si scrive nel registro, perché un refuso in una
 * variabile d'ambiente non deve produrre un sito senza stile.
 */
function scegli(valore: unknown): Tema {
  if (typeof valore === 'string' && (TEMI as readonly string[]).includes(valore)) {
    return valore as Tema;
  }
  if (valore !== undefined && valore !== '') {
    console.warn(`[tema] valore PUBLIC_TEMA non riconosciuto: ${String(valore)} — uso il tema 1`);
  }
  return '1';
}

export const tema: Tema = scegli(richiesto);
