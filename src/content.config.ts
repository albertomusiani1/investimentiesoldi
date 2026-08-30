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
  'Produzione',
  'Validazione',
  'Elettrificazione',
] as const;

export type CategoriaProgetto = (typeof CATEGORIE_PROGETTO)[number];

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
    })
    .strict(),
});

export const collections = { progetti };
