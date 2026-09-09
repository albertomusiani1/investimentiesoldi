/**
 * La Marketing API esprime i budget in "unita' minori" (centesimi per l'euro).
 * I tool invece parlano in unita' intere (25.50 = 25,50 EUR), quindi serve
 * conoscere il numero di decimali della valuta dell'account.
 */

/** Valute senza decimali: 1 unita' minore = 1 unita' intera. */
const ZERO_DECIMAL = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW',
  'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
]);

/** Valute con tre decimali. */
const THREE_DECIMAL = new Set(['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND']);

/** Quante unita' minori stanno in una unita' intera della valuta. */
export function currencyOffset(currency: string): number {
  const code = currency.trim().toUpperCase();
  if (ZERO_DECIMAL.has(code)) return 1;
  if (THREE_DECIMAL.has(code)) return 1000;
  return 100;
}

/** Da unita' minori (come le restituisce Meta) a unita' intere. */
export function toMajor(minor: string | number | null | undefined, currency: string): number | null {
  if (minor === null || minor === undefined || minor === '') return null;
  const value = typeof minor === 'string' ? Number(minor) : minor;
  if (!Number.isFinite(value)) return null;
  return value / currencyOffset(currency);
}

/** Da unita' intere a unita' minori intere (come le vuole Meta). */
export function toMinor(major: number, currency: string): number {
  return Math.round(major * currencyOffset(currency));
}

/** Formattazione per i messaggi mostrati all'utente. */
export function formatMoney(major: number | null, currency: string): string {
  if (major === null) return 'non impostato';
  const decimals = currencyOffset(currency) === 1 ? 0 : currencyOffset(currency) === 1000 ? 3 : 2;
  return `${major.toFixed(decimals)} ${currency.toUpperCase()}`;
}
