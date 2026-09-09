/**
 * Caricamento del file `.env` accanto al package, usando il supporto nativo
 * di Node (nessuna dipendenza esterna).
 *
 * Le variabili gia' presenti nell'ambiente hanno la precedenza, cosi' in
 * produzione i secret del provider vincono sempre su un eventuale file.
 */
export function loadDotEnv(): string | null {
  const explicit = process.env.MCP_ADS_ENV_FILE?.trim();
  const candidate = explicit ?? new URL('../.env', import.meta.url).pathname;

  if (typeof process.loadEnvFile !== 'function') {
    console.error('[mcp-ads] questa versione di Node non supporta .env nativo: servono variabili d\'ambiente esplicite');
    return null;
  }

  try {
    process.loadEnvFile(candidate);
    return candidate;
  } catch {
    // Nessun .env: e' il caso normale quando i valori arrivano dall'ambiente.
    return null;
  }
}
