/**
 * Configurazione del server, letta interamente dall'ambiente.
 *
 * Nessun segreto vive nel repository: il token sta nel `.env` locale (git-ignorato)
 * oppure nei secret del provider di hosting.
 */

/** Versione della Graph API usata per tutte le chiamate. Sovrascrivibile con META_API_VERSION. */
export const DEFAULT_META_API_VERSION = 'v23.0';

export class ConfigError extends Error {}

/** Limiti che il server si autoimpone, indipendentemente da cosa chiede il modello. */
export interface Guards {
  /** Se true, i tool di scrittura rifiutano qualsiasi modifica. */
  readOnly: boolean;
  /** Se valorizzato, solo questi ad account sono raggiungibili (id normalizzati `act_...`). */
  allowedAccountIds: string[] | null;
  /** Tetto massimo per il budget giornaliero, in valuta dell'account (unita' intere, es. 50 = 50 EUR). */
  maxDailyBudget: number | null;
  /** Tetto massimo per il budget totale (lifetime), stessa unita'. */
  maxLifetimeBudget: number | null;
}

export interface MetaConfig {
  accessToken: string;
  apiVersion: string;
  guards: Guards;
  /** File JSONL su cui registrare ogni scrittura. Se null, l'audit va su stderr. */
  auditLogPath: string | null;
}

export type Env = Record<string, string | undefined>;

/** Aggiunge il prefisso `act_` se manca, cosi' `123` e `act_123` sono equivalenti. */
export function normalizeAccountId(id: string): string {
  const trimmed = id.trim();
  return trimmed.startsWith('act_') ? trimmed : `act_${trimmed}`;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw.trim() === '') return fallback;
  return ['1', 'true', 'yes', 'si', 'on'].includes(raw.trim().toLowerCase());
}

function parseMoney(raw: string | undefined, name: string): number | null {
  if (raw === undefined || raw.trim() === '') return null;
  const value = Number(raw.replace(',', '.'));
  if (!Number.isFinite(value) || value <= 0) {
    throw new ConfigError(`${name} deve essere un numero positivo, ricevuto: ${raw}`);
  }
  return value;
}

function parseList(raw: string | undefined): string[] | null {
  if (raw === undefined || raw.trim() === '') return null;
  const items = raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map(normalizeAccountId);
  return items.length > 0 ? items : null;
}

export function loadMetaConfig(env: Env): MetaConfig {
  const accessToken = env.META_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new ConfigError(
      'META_ACCESS_TOKEN non impostato. Vedi il README, sezione "Ottenere il token Meta".',
    );
  }

  return {
    accessToken,
    apiVersion: env.META_API_VERSION?.trim() || DEFAULT_META_API_VERSION,
    guards: {
      readOnly: parseBool(env.META_READ_ONLY, false),
      allowedAccountIds: parseList(env.META_ALLOWED_ACCOUNT_IDS),
      maxDailyBudget: parseMoney(env.META_MAX_DAILY_BUDGET, 'META_MAX_DAILY_BUDGET'),
      maxLifetimeBudget: parseMoney(env.META_MAX_LIFETIME_BUDGET, 'META_MAX_LIFETIME_BUDGET'),
    },
    auditLogPath: env.MCP_ADS_AUDIT_LOG?.trim() || null,
  };
}

/** Riassunto leggibile dei guardrail attivi, mostrato da `meta_check_access`. */
export function describeGuards(guards: Guards): string[] {
  const lines: string[] = [];
  lines.push(guards.readOnly ? 'SOLA LETTURA: ogni scrittura e\' disabilitata' : 'scritture abilitate, ma solo con confirm=true');
  lines.push(
    guards.allowedAccountIds
      ? `account consentiti: ${guards.allowedAccountIds.join(', ')}`
      : 'account consentiti: tutti quelli visibili al token',
  );
  lines.push(
    guards.maxDailyBudget === null
      ? 'tetto budget giornaliero: nessuno'
      : `tetto budget giornaliero: ${guards.maxDailyBudget}`,
  );
  lines.push(
    guards.maxLifetimeBudget === null
      ? 'tetto budget lifetime: nessuno'
      : `tetto budget lifetime: ${guards.maxLifetimeBudget}`,
  );
  return lines;
}
