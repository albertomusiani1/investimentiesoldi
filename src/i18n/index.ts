import it from './it.json';

/**
 * Registro delle lingue del sito.
 *
 * Per aggiungere una lingua:
 *  1. crea `src/i18n/<codice>.json` con le stesse chiavi di `it.json`;
 *  2. importalo qui sopra e aggiungilo a `dizionari` e a `locales`;
 *  3. aggiungi il codice a `i18n.locales` in `astro.config.mjs`.
 * TypeScript segnala in fase di build ogni chiave mancante nel nuovo file.
 */
export const defaultLocale = 'it';
export const locales = ['it'] as const;

export type Locale = (typeof locales)[number];

type Dizionario = typeof it;

const dizionari: Record<Locale, Dizionario> = { it };

/** Percorsi puntati verso le sole foglie stringa del dizionario. */
type Foglie<T> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends readonly string[]
      ? never
      : `${K}.${Foglie<T[K]>}`;
}[keyof T & string];

/** Percorsi puntati verso le foglie che sono elenchi di stringhe. */
type FoglieElenco<T> = {
  [K in keyof T & string]: T[K] extends readonly string[]
    ? K
    : T[K] extends string
      ? never
      : `${K}.${FoglieElenco<T[K]>}`;
}[keyof T & string];

export type ChiaveTraduzione = Foglie<Dizionario>;
export type ChiaveElenco = FoglieElenco<Dizionario>;

export function isLocale(valore: string | undefined): valore is Locale {
  return valore !== undefined && (locales as readonly string[]).includes(valore);
}

/**
 * Restituisce la stringa di interfaccia associata alla chiave.
 * Se la chiave non esiste o non punta a una stringa lancia un errore:
 * la build si interrompe invece di pubblicare una pagina con un buco.
 */
export function t(chiave: ChiaveTraduzione, locale: Locale = defaultLocale): string {
  let nodo: unknown = dizionari[locale];

  for (const parte of chiave.split('.')) {
    if (typeof nodo !== 'object' || nodo === null || !(parte in nodo)) {
      throw new Error(`Chiave di traduzione mancante: "${chiave}" (lingua: ${locale})`);
    }
    nodo = (nodo as Record<string, unknown>)[parte];
  }

  if (typeof nodo !== 'string') {
    throw new Error(`La chiave di traduzione "${chiave}" non punta a una stringa (lingua: ${locale})`);
  }

  return nodo;
}

/**
 * Come `t()`, ma per le chiavi che contengono un elenco di stringhe —
 * per esempio le parole che ruotano dentro un titolo.
 */
export function tElenco(chiave: ChiaveElenco, locale: Locale = defaultLocale): string[] {
  let nodo: unknown = dizionari[locale];

  for (const parte of chiave.split('.')) {
    if (typeof nodo !== 'object' || nodo === null || !(parte in nodo)) {
      throw new Error(`Chiave di traduzione mancante: "${chiave}" (lingua: ${locale})`);
    }
    nodo = (nodo as Record<string, unknown>)[parte];
  }

  if (!Array.isArray(nodo) || nodo.some((voce) => typeof voce !== 'string')) {
    throw new Error(
      `La chiave di traduzione "${chiave}" non punta a un elenco di stringhe (lingua: ${locale})`
    );
  }

  return nodo as string[];
}

/** Versione legata a una lingua, comoda nei componenti: `const tt = useT(locale)`. */
export function useT(locale: Locale = defaultLocale) {
  return (chiave: ChiaveTraduzione): string => t(chiave, locale);
}
