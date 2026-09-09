import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Collection "progetti".
 *
 * Ogni file in `src/content/progetti/*.md` diventa una pagina
 * `/progetti/<nome-del-file>`. Lo schema qui sotto è la rete di sicurezza:
 * se un campo obbligatorio manca, ha il tipo sbagliato o è scritto male,
 * `npm run build` si interrompe con un errore che indica file e campo.
 *
 * `.strict()` fa fallire anche i campi non previsti: un `titollo` scritto
 * male non passa in silenzio.
 */
export const CATEGORIE_PROGETTO = [
  'Progettazione',
  'Montaggio',
  'Revisione',
  'Collaudo',
] as const;

export type CategoriaProgetto = (typeof CATEGORIE_PROGETTO)[number];

/**
 * Un disegno allegato al progetto: una tavola 2D o un modello 3D.
 *
 * - `disegno2d` vuole un SVG (o un PNG) in `public/disegni/`;
 * - `modello3d` vuole un **STL**, il formato che ogni CAD esporta, in
 *   `public/modelli/`, più un'anteprima PNG mostrata quando JavaScript è
 *   disattivato o mentre il modello si carica.
 */
const disegno = z
  .object({
    titolo: z.string().min(3).max(90),
    tipo: z.enum(['disegno2d', 'modello3d']),
    /** Percorso del file dalla root del sito, es. /modelli/puleggia.stl */
    file: z.string().startsWith('/'),
    /** Obbligatoria per i modelli 3D: è la ricaduta senza JavaScript. */
    anteprima: z.string().startsWith('/').optional(),
    /** Una riga di contesto: scala, revisione, materiale. */
    nota: z.string().max(160).optional(),
  })
  .strict()
  .refine((valore) => valore.tipo !== 'modello3d' || valore.anteprima !== undefined, {
    message: "un disegno di tipo modello3d deve avere anche il campo anteprima (l'immagine mostrata senza JavaScript)",
    path: ['anteprima'],
  });

export type Disegno = z.infer<typeof disegno>;

const progetti = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/progetti' }),
  schema: z
    .object({
      /** Titolo del progetto, usato come <h1> della pagina di dettaglio. */
      titolo: z.string().min(3).max(120),
      /** Nome del cliente, oppure "Confidenziale" se non è pubblicabile. */
      cliente: z.string().min(2).max(80),
      /** Deve essere uno dei valori di CATEGORIE_PROGETTO. */
      categoria: z.enum(CATEGORIE_PROGETTO),
      /** Data di chiusura della commessa, formato AAAA-MM-GG. */
      data: z.coerce.date(),
      /** Riassunto per la griglia e per la meta description: massimo 160 caratteri. */
      descrizioneBreve: z.string().min(20).max(160),
      /** Percorso dell'immagine dalla root del sito, es. /img/progetti/nome.svg */
      immagine: z.string().startsWith('/'),
      /** Testo alternativo descrittivo dell'immagine: obbligatorio. */
      immagineAlt: z.string().min(10),
      /** true per mostrare il progetto fra quelli in evidenza in home. */
      inEvidenza: z.boolean().default(false),
      /** Ordine crescente nella griglia; se assente si ordina per data decrescente. */
      ordine: z.number().int().positive().optional(),
      /** Tavole e modelli mostrati nel visualizzatore, in fondo alla pagina. */
      disegni: z.array(disegno).max(8).optional(),
    })
    .strict(),
});

export const collections = { progetti };
