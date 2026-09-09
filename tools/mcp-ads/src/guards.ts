/**
 * Controlli che il server applica prima di ogni scrittura.
 *
 * Sono deliberatamente lato server: il modello puo' chiedere qualunque cosa,
 * ma i limiti li decide l'ambiente, non il prompt.
 */
import type { Guards, MetaConfig } from './config.js';
import { normalizeAccountId } from './config.js';

export class GuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardError';
  }
}

/** Blocca gli account fuori dall'allowlist, se ne e' stata configurata una. */
export function assertAccountAllowed(accountId: string, guards: Guards): void {
  if (!guards.allowedAccountIds) return;
  const normalized = normalizeAccountId(accountId);
  if (!guards.allowedAccountIds.includes(normalized)) {
    throw new GuardError(
      `L'account ${normalized} non e' nella allowlist META_ALLOWED_ACCOUNT_IDS ` +
        `(consentiti: ${guards.allowedAccountIds.join(', ')}).`,
    );
  }
}

/** Blocca tutte le scritture quando il server e' in sola lettura. */
export function assertWritesAllowed(guards: Guards): void {
  if (guards.readOnly) {
    throw new GuardError(
      'Il server e\' in modalita\' sola lettura (META_READ_ONLY=true): nessuna modifica e\' possibile. ' +
        'Per abilitare le scritture cambia la variabile d\'ambiente e riavvia il server.',
    );
  }
}

/**
 * Applica il tetto di budget. Volutamente senza parametro di override:
 * per superare il tetto bisogna cambiare l'ambiente, cosa che il modello non puo' fare.
 *
 * Va invocato prima di qualsiasi chiamata di rete: il limite e' un confronto fra numeri
 * e non deve dipendere da cio' che risponde l'API.
 */
export function assertBudgetWithinCap(
  kind: 'daily' | 'lifetime',
  amountMajor: number,
  guards: Guards,
  currency?: string,
): void {
  const cap = kind === 'daily' ? guards.maxDailyBudget : guards.maxLifetimeBudget;
  const variable = kind === 'daily' ? 'META_MAX_DAILY_BUDGET' : 'META_MAX_LIFETIME_BUDGET';
  if (cap !== null && amountMajor > cap) {
    throw new GuardError(
      `Budget ${kind} richiesto ${amountMajor} ${currency ?? '(valuta account)'}, oltre il tetto di ${cap} ` +
        `impostato in ${variable}. Nessuna modifica effettuata: alza il tetto nell'ambiente ` +
        'se e\' davvero quello che vuoi.',
    );
  }
}

export interface AuditEntry {
  timestamp: string;
  tool: string;
  entity: string;
  id: string;
  before: unknown;
  after: unknown;
  outcome: 'applied' | 'failed';
  error?: string;
}

/**
 * Registra ogni scrittura. Su file se MCP_ADS_AUDIT_LOG e' impostato,
 * altrimenti su stderr (che su Workers finisce nei log del provider).
 */
export async function audit(entry: AuditEntry, config: MetaConfig): Promise<void> {
  const line = JSON.stringify(entry);
  if (config.auditLogPath) {
    try {
      const { appendFile } = await import('node:fs/promises');
      await appendFile(config.auditLogPath, `${line}\n`, 'utf8');
      return;
    } catch (error) {
      // Su runtime senza filesystem, o se il path non e' scrivibile, si degrada su stderr.
      console.error(`[audit] scrittura su ${config.auditLogPath} fallita: ${String(error)}`);
    }
  }
  console.error(`[audit] ${line}`);
}
