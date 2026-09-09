/**
 * Definizione dei tool Meta Ads esposti via MCP.
 *
 * Convenzioni adottate in tutto il file:
 *  - i budget si esprimono in unita' intere di valuta (25.5 = 25,50 EUR), mai in centesimi;
 *  - ogni tool che modifica qualcosa richiede `confirm: true` e senza di esso
 *    restituisce solo un'anteprima con il valore attuale letto dal vivo;
 *  - gli errori Meta vengono tradotti in messaggi leggibili, non rilanciati grezzi.
 */
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { describeGuards, normalizeAccountId, type MetaConfig } from '../config.js';
import { assertAccountAllowed, assertBudgetWithinCap, assertWritesAllowed, audit, GuardError } from '../guards.js';
import { MetaApiError, MetaClient } from './client.js';
import { formatMoney, toMajor, toMinor } from './currency.js';

const DATE_PRESETS = [
  'today', 'yesterday', 'last_3d', 'last_7d', 'last_14d', 'last_28d', 'last_30d', 'last_90d',
  'this_week_mon_today', 'last_week_mon_sun', 'this_month', 'last_month',
  'this_quarter', 'last_quarter', 'this_year', 'last_year', 'maximum',
] as const;

const STATUS_FILTERS = ['ACTIVE', 'PAUSED', 'ARCHIVED', 'ALL'] as const;

const DEFAULT_METRICS = [
  'spend', 'impressions', 'clicks', 'ctr', 'cpc', 'cpm', 'reach', 'frequency',
  'actions', 'action_values', 'cost_per_action_type', 'purchase_roas',
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Percorso Graph per il livello di entita' indicato. */
const EDGE: Record<'campaign' | 'adset' | 'ad', string> = {
  campaign: 'campaigns',
  adset: 'adsets',
  ad: 'ads',
};

interface AccountContext {
  id: string;
  name: string;
  currency: string;
}

function text(body: string): CallToolResult {
  return { content: [{ type: 'text', text: body }] };
}

function failure(body: string): CallToolResult {
  return { content: [{ type: 'text', text: body }], isError: true };
}

/** Testo leggibile + blocco JSON, cosi' i dati restano ispezionabili. */
function report(summary: string, data: unknown): CallToolResult {
  return text(`${summary}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``);
}

/**
 * Converte le eccezioni note nel formato d'errore MCP.
 * Un errore Meta o un guardrail non sono un crash: sono una risposta.
 */
async function guarded(run: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof GuardError) return failure(`Bloccato dai guardrail: ${error.message}`);
    if (error instanceof MetaApiError) return failure(`Meta ha rifiutato la richiesta: ${error.describe()}`);
    if (error instanceof Error) return failure(`Errore inatteso: ${error.message}`);
    return failure(`Errore inatteso: ${String(error)}`);
  }
}

async function accountContext(client: MetaClient, accountId: string): Promise<AccountContext> {
  const normalized = normalizeAccountId(accountId);
  const account = await client.get<{ id: string; name?: string; currency?: string }>(normalized, {
    fields: 'id,name,currency',
  });
  return {
    id: account.id,
    name: account.name ?? normalized,
    currency: account.currency ?? 'EUR',
  };
}

/** Risale all'ad account di una entita', per applicare l'allowlist anche a id "nudi". */
async function ownerAccountId(client: MetaClient, entityId: string): Promise<string> {
  const entity = await client.get<{ account_id?: string }>(entityId, { fields: 'account_id' });
  if (!entity.account_id) {
    throw new GuardError(`Impossibile determinare l'ad account di ${entityId}.`);
  }
  return normalizeAccountId(entity.account_id);
}

function statusFilter(status: (typeof STATUS_FILTERS)[number]): Record<string, string[]> {
  if (status === 'ALL') return {};
  if (status === 'ACTIVE') return { effective_status: ['ACTIVE'] };
  if (status === 'PAUSED') return { effective_status: ['PAUSED', 'CAMPAIGN_PAUSED', 'ADSET_PAUSED'] };
  return { effective_status: ['ARCHIVED'] };
}

/** Appiattisce gli array `actions`/`action_values` in mappe leggibili. */
function flattenActions(rows: Array<Record<string, unknown>>, includeRaw: boolean): Array<Record<string, unknown>> {
  const pick = (node: unknown): Record<string, number> => {
    const out: Record<string, number> = {};
    if (!Array.isArray(node)) return out;
    for (const item of node) {
      if (!item || typeof item !== 'object') continue;
      const { action_type: type, value } = item as { action_type?: string; value?: string };
      if (typeof type === 'string' && value !== undefined) out[type] = Number(value);
    }
    return out;
  };

  return rows.map((row) => {
    const flat: Record<string, unknown> = { ...row };
    const conversions = pick(row.actions);
    const conversionValues = pick(row.action_values);
    const costPerAction = pick(row.cost_per_action_type);
    const roas = pick(row.purchase_roas);

    if (!includeRaw) {
      delete flat.actions;
      delete flat.action_values;
      delete flat.cost_per_action_type;
      delete flat.purchase_roas;
    }
    if (Object.keys(conversions).length > 0) flat.conversioni = conversions;
    if (Object.keys(conversionValues).length > 0) flat.valore_conversioni = conversionValues;
    if (Object.keys(costPerAction).length > 0) flat.costo_per_azione = costPerAction;
    if (Object.keys(roas).length > 0) flat.roas = roas;
    return flat;
  });
}

export function registerMetaTools(server: McpServer, config: MetaConfig): void {
  const client = new MetaClient(config);
  const { guards } = config;

  /** Applica l'allowlist a una entita' qualsiasi, con una sola chiamata extra e solo se serve. */
  const assertEntityAllowed = async (entityId: string): Promise<void> => {
    if (!guards.allowedAccountIds) return;
    const accountId = entityId.startsWith('act_') ? entityId : await ownerAccountId(client, entityId);
    assertAccountAllowed(accountId, guards);
  };

  server.registerTool(
    'meta_check_access',
    {
      title: 'Verifica accesso Meta',
      description:
        'Controlla che il token Meta funzioni ed elenca gli ad account raggiungibili e i guardrail attivi. ' +
        'Da usare come primo comando di diagnostica quando qualcosa non funziona.',
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () =>
      guarded(async () => {
        const me = await client.get<{ id: string; name?: string }>('me', { fields: 'id,name' });
        const accounts = await client.getPaged<{ id: string; name?: string; currency?: string; account_status?: number }>(
          'me/adaccounts',
          { fields: 'id,name,currency,account_status', limit: 100 },
        );
        const visible = guards.allowedAccountIds
          ? accounts.data.filter((account) => guards.allowedAccountIds?.includes(normalizeAccountId(account.id)))
          : accounts.data;

        return report(
          `Token valido. Identita': ${me.name ?? '(senza nome)'} (${me.id}). ` +
            `Ad account utilizzabili: ${visible.length}.\n\nGuardrail attivi:\n- ${describeGuards(guards).join('\n- ')}`,
          { api_version: config.apiVersion, accounts: visible },
        );
      }),
  );

  server.registerTool(
    'meta_list_ad_accounts',
    {
      title: 'Elenca ad account',
      description: 'Elenca gli ad account Meta accessibili, con valuta, stato e speso totale.',
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () =>
      guarded(async () => {
        const accounts = await client.getPaged<Record<string, unknown>>('me/adaccounts', {
          fields: 'id,account_id,name,currency,account_status,timezone_name,amount_spent,balance',
          limit: 100,
        });
        const visible = guards.allowedAccountIds
          ? accounts.data.filter((account) =>
              guards.allowedAccountIds?.includes(normalizeAccountId(String(account.id))),
            )
          : accounts.data;
        return report(`${visible.length} ad account disponibili.`, visible);
      }),
  );

  server.registerTool(
    'meta_list_campaigns',
    {
      title: 'Elenca campagne',
      description:
        'Elenca le campagne di un ad account con stato, obiettivo e budget (in unita\' intere di valuta). ' +
        'Non include le performance: per quelle usa meta_insights.',
      inputSchema: {
        account_id: z.string().describe('Id ad account, con o senza prefisso act_'),
        status: z.enum(STATUS_FILTERS).default('ALL').describe('Filtro su stato effettivo'),
        limit: z.number().int().min(1).max(500).default(50),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, status, limit }) =>
      guarded(async () => {
        assertAccountAllowed(account_id, guards);
        const account = await accountContext(client, account_id);
        const campaigns = await client.getPaged<Record<string, unknown>>(`${account.id}/campaigns`, {
          fields:
            'id,name,status,effective_status,objective,daily_budget,lifetime_budget,budget_remaining,' +
            'bid_strategy,start_time,stop_time,updated_time',
          limit,
          ...statusFilter(status),
        });

        const rows = campaigns.data.map((campaign) => ({
          ...campaign,
          daily_budget: formatMoney(toMajor(campaign.daily_budget as string, account.currency), account.currency),
          lifetime_budget: formatMoney(toMajor(campaign.lifetime_budget as string, account.currency), account.currency),
          budget_remaining: formatMoney(toMajor(campaign.budget_remaining as string, account.currency), account.currency),
        }));

        return report(
          `${rows.length} campagne in ${account.name} (${account.currency})${campaigns.truncated ? ', elenco troncato' : ''}.`,
          rows,
        );
      }),
  );

  server.registerTool(
    'meta_list_adsets',
    {
      title: 'Elenca adset',
      description:
        'Elenca gli adset di un ad account o di una singola campagna, con budget e obiettivo di ottimizzazione.',
      inputSchema: {
        account_id: z.string().optional().describe('Id ad account; alternativo a campaign_id'),
        campaign_id: z.string().optional().describe('Id campagna; alternativo a account_id'),
        status: z.enum(STATUS_FILTERS).default('ALL'),
        limit: z.number().int().min(1).max(500).default(50),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, campaign_id, status, limit }) =>
      guarded(async () => {
        if (!account_id && !campaign_id) {
          return failure('Serve almeno uno tra account_id e campaign_id.');
        }
        const parent = account_id ? normalizeAccountId(account_id) : campaign_id!;
        await assertEntityAllowed(parent);

        const accountId = account_id ? normalizeAccountId(account_id) : await ownerAccountId(client, campaign_id!);
        const account = await accountContext(client, accountId);

        const adsets = await client.getPaged<Record<string, unknown>>(`${parent}/adsets`, {
          fields:
            'id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget,budget_remaining,' +
            'bid_amount,billing_event,optimization_goal,start_time,end_time,updated_time',
          limit,
          ...statusFilter(status),
        });

        const rows = adsets.data.map((adset) => ({
          ...adset,
          daily_budget: formatMoney(toMajor(adset.daily_budget as string, account.currency), account.currency),
          lifetime_budget: formatMoney(toMajor(adset.lifetime_budget as string, account.currency), account.currency),
          budget_remaining: formatMoney(toMajor(adset.budget_remaining as string, account.currency), account.currency),
        }));

        return report(
          `${rows.length} adset${campaign_id ? ` nella campagna ${campaign_id}` : ` in ${account.name}`}` +
            `${adsets.truncated ? ', elenco troncato' : ''}.`,
          rows,
        );
      }),
  );

  server.registerTool(
    'meta_list_ads',
    {
      title: 'Elenca inserzioni',
      description: 'Elenca le inserzioni di un ad account, campagna o adset, con la creativita\' associata.',
      inputSchema: {
        account_id: z.string().optional(),
        campaign_id: z.string().optional(),
        adset_id: z.string().optional(),
        status: z.enum(STATUS_FILTERS).default('ALL'),
        limit: z.number().int().min(1).max(500).default(50),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ account_id, campaign_id, adset_id, status, limit }) =>
      guarded(async () => {
        const parent = adset_id ?? campaign_id ?? (account_id ? normalizeAccountId(account_id) : null);
        if (!parent) return failure('Serve almeno uno tra account_id, campaign_id e adset_id.');
        await assertEntityAllowed(parent);

        const ads = await client.getPaged<Record<string, unknown>>(`${parent}/ads`, {
          fields:
            'id,name,adset_id,campaign_id,status,effective_status,updated_time,' +
            'creative{id,name,thumbnail_url}',
          limit,
          ...statusFilter(status),
        });
        return report(`${ads.data.length} inserzioni sotto ${parent}${ads.truncated ? ", elenco troncato" : ""}.`, ads.data);
      }),
  );

  server.registerTool(
    'meta_insights',
    {
      title: 'Performance Meta Ads',
      description:
        'Legge le metriche di performance (spesa, impression, click, CTR, CPC, conversioni, ROAS) ' +
        'per un ad account, campagna, adset o inserzione. Usa level per scegliere il livello di dettaglio ' +
        'e breakdowns per segmentare (es. eta\', piattaforma, paese).',
      inputSchema: {
        object_id: z.string().describe('act_<id> per l\'account, oppure id di campagna, adset o inserzione'),
        level: z.enum(['account', 'campaign', 'adset', 'ad']).optional().describe('Livello di aggregazione delle righe'),
        date_preset: z.enum(DATE_PRESETS).optional().describe('Intervallo predefinito; ignorato se passi since/until'),
        since: z.string().regex(DATE_RE).optional().describe('Data inizio YYYY-MM-DD'),
        until: z.string().regex(DATE_RE).optional().describe('Data fine YYYY-MM-DD'),
        breakdowns: z.array(z.string()).optional().describe('Es. ["publisher_platform"], ["age","gender"], ["country"]'),
        metrics: z.array(z.string()).optional().describe('Sovrascrive il set di metriche predefinito'),
        time_increment: z
          .union([z.number().int().min(1).max(90), z.literal('monthly')])
          .optional()
          .describe('1 per una riga al giorno, "monthly" per riga mensile'),
        limit: z.number().int().min(1).max(500).default(50),
        include_raw: z.boolean().default(false).describe('Mantiene anche gli array grezzi actions/action_values'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ object_id, level, date_preset, since, until, breakdowns, metrics, time_increment, limit, include_raw }) =>
      guarded(async () => {
        await assertEntityAllowed(object_id);

        const isAccount = object_id.startsWith('act_');
        const resolvedLevel = level ?? (isAccount ? 'account' : 'campaign');
        const fields = [...(metrics ?? DEFAULT_METRICS)];
        for (const nameField of ['campaign_name', 'adset_name', 'ad_name'] as const) {
          const wanted =
            (nameField === 'campaign_name' && ['campaign', 'adset', 'ad'].includes(resolvedLevel)) ||
            (nameField === 'adset_name' && ['adset', 'ad'].includes(resolvedLevel)) ||
            (nameField === 'ad_name' && resolvedLevel === 'ad');
          if (wanted && !fields.includes(nameField)) fields.push(nameField);
        }

        const params: Record<string, string | number | string[] | undefined> = {
          level: resolvedLevel,
          fields: fields.join(','),
          limit,
        };
        if (since && until) params.time_range = JSON.stringify({ since, until });
        else if (since || until) return failure('since e until vanno passati insieme.');
        else params.date_preset = date_preset ?? 'last_7d';
        if (breakdowns && breakdowns.length > 0) params.breakdowns = breakdowns.join(',');
        if (time_increment !== undefined) params.time_increment = String(time_increment);

        const insights = await client.getPaged<Record<string, unknown>>(`${object_id}/insights`, params);
        const rows = flattenActions(insights.data, include_raw);

        const totalSpend = rows.reduce((sum, row) => sum + Number(row.spend ?? 0), 0);
        const period = since && until ? `${since} -> ${until}` : (date_preset ?? 'last_7d');
        const warnings = insights.usage.length > 0
          ? `\nAttenzione: ${insights.usage.map((usage) => usage.detail).join('; ')}.`
          : '';

        return report(
          `${rows.length} righe a livello "${resolvedLevel}" su ${object_id}, periodo ${period}. ` +
            `Spesa totale nelle righe: ${totalSpend.toFixed(2)}.` +
            `${insights.truncated ? ' Risultati troncati: alza limit o restringi il periodo.' : ''}${warnings}`,
          rows,
        );
      }),
  );

  server.registerTool(
    'meta_set_status',
    {
      title: 'Attiva o metti in pausa (richiede conferma)',
      description:
        'Attiva o mette in pausa una campagna, un adset o una inserzione. ' +
        'Chiamato senza confirm=true non modifica nulla: restituisce solo l\'anteprima con lo stato attuale. ' +
        'Mostra sempre l\'anteprima all\'utente e attendi il suo assenso prima di richiamare con confirm=true.',
      inputSchema: {
        entity: z.enum(['campaign', 'adset', 'ad']),
        id: z.string().describe('Id dell\'entita\' da modificare'),
        status: z.enum(['ACTIVE', 'PAUSED']),
        confirm: z.boolean().default(false).describe('Deve essere true perche\' la modifica venga applicata'),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    },
    async ({ entity, id, status, confirm }) =>
      guarded(async () => {
        assertWritesAllowed(guards);
        await assertEntityAllowed(id);

        const current = await client.get<Record<string, unknown>>(id, {
          fields: 'id,name,status,effective_status,account_id',
        });
        const before = {
          id: current.id,
          name: current.name,
          status: current.status,
          effective_status: current.effective_status,
        };

        if (current.status === status) {
          return text(`Nessuna modifica necessaria: ${entity} "${current.name}" (${id}) e' gia' ${status}.`);
        }

        if (!confirm) {
          return report(
            `ANTEPRIMA, nulla e' stato modificato.\n` +
              `${entity} "${current.name}" (${id})\n` +
              `  stato attuale: ${current.status} (effettivo: ${current.effective_status})\n` +
              `  stato richiesto: ${status}\n\n` +
              'Per applicare, richiama meta_set_status con gli stessi parametri e confirm=true.',
            before,
          );
        }

        try {
          await client.post(id, { status });
        } catch (error) {
          await audit(
            {
              timestamp: new Date().toISOString(),
              tool: 'meta_set_status',
              entity,
              id,
              before,
              after: { status },
              outcome: 'failed',
              error: error instanceof Error ? error.message : String(error),
            },
            config,
          );
          throw error;
        }

        const after = await client.get<Record<string, unknown>>(id, {
          fields: 'id,name,status,effective_status',
        });
        await audit(
          {
            timestamp: new Date().toISOString(),
            tool: 'meta_set_status',
            entity,
            id,
            before,
            after,
            outcome: 'applied',
          },
          config,
        );

        return report(
          `Fatto: ${entity} "${current.name}" (${id}) da ${before.status} a ${after.status} ` +
            `(effettivo: ${after.effective_status}).`,
          { before, after },
        );
      }),
  );

  server.registerTool(
    'meta_set_budget',
    {
      title: 'Modifica budget (richiede conferma)',
      description:
        'Cambia il budget giornaliero o totale di una campagna o di un adset. Gli importi sono in unita\' ' +
        'intere di valuta (25.5 = 25,50 EUR), non in centesimi. Chiamato senza confirm=true mostra solo ' +
        'l\'anteprima con il budget attuale e la variazione percentuale. Mostra sempre l\'anteprima ' +
        'all\'utente e attendi il suo assenso prima di richiamare con confirm=true.',
      inputSchema: {
        entity: z.enum(['campaign', 'adset']),
        id: z.string(),
        daily_budget: z.number().positive().optional().describe('Budget giornaliero in unita\' intere di valuta'),
        lifetime_budget: z.number().positive().optional().describe('Budget totale in unita\' intere di valuta'),
        confirm: z.boolean().default(false).describe('Deve essere true perche\' la modifica venga applicata'),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    },
    async ({ entity, id, daily_budget, lifetime_budget, confirm }) =>
      guarded(async () => {
        assertWritesAllowed(guards);
        if ((daily_budget === undefined) === (lifetime_budget === undefined)) {
          return failure('Passa esattamente uno tra daily_budget e lifetime_budget.');
        }
        const kind = daily_budget !== undefined ? 'daily' : 'lifetime';
        const requested = (daily_budget ?? lifetime_budget)!;
        // Il tetto si verifica subito: nessuna chiamata a Meta se l'importo e' fuori limite.
        assertBudgetWithinCap(kind, requested, guards);

        await assertEntityAllowed(id);

        const current = await client.get<Record<string, unknown>>(id, {
          fields: 'id,name,status,account_id,daily_budget,lifetime_budget',
        });
        const account = await accountContext(client, String(current.account_id));
        assertAccountAllowed(account.id, guards);

        const currentMajor = toMajor(
          (kind === 'daily' ? current.daily_budget : current.lifetime_budget) as string,
          account.currency,
        );
        const before = {
          id: current.id,
          name: current.name,
          status: current.status,
          currency: account.currency,
          daily_budget: formatMoney(toMajor(current.daily_budget as string, account.currency), account.currency),
          lifetime_budget: formatMoney(toMajor(current.lifetime_budget as string, account.currency), account.currency),
        };

        const deltaLine =
          currentMajor === null || currentMajor === 0
            ? 'variazione: budget non impostato prima'
            : `variazione: ${(((requested - currentMajor) / currentMajor) * 100).toFixed(1)}%`;

        if (!confirm) {
          return report(
            `ANTEPRIMA, nulla e' stato modificato.\n` +
              `${entity} "${current.name}" (${id}) in ${account.name}\n` +
              `  budget ${kind} attuale: ${formatMoney(currentMajor, account.currency)}\n` +
              `  budget ${kind} richiesto: ${formatMoney(requested, account.currency)}\n` +
              `  ${deltaLine}\n\n` +
              'Controlla che il valore attuale corrisponda a quello che vedi in Gestione inserzioni. ' +
              'Per applicare, richiama meta_set_budget con gli stessi parametri e confirm=true.',
            before,
          );
        }

        const field = kind === 'daily' ? 'daily_budget' : 'lifetime_budget';
        const payload = { [field]: toMinor(requested, account.currency) };

        try {
          await client.post(id, payload);
        } catch (error) {
          await audit(
            {
              timestamp: new Date().toISOString(),
              tool: 'meta_set_budget',
              entity,
              id,
              before,
              after: payload,
              outcome: 'failed',
              error: error instanceof Error ? error.message : String(error),
            },
            config,
          );
          throw error;
        }

        const updated = await client.get<Record<string, unknown>>(id, {
          fields: 'id,name,daily_budget,lifetime_budget',
        });
        const after = {
          id: updated.id,
          name: updated.name,
          daily_budget: formatMoney(toMajor(updated.daily_budget as string, account.currency), account.currency),
          lifetime_budget: formatMoney(toMajor(updated.lifetime_budget as string, account.currency), account.currency),
        };
        await audit(
          {
            timestamp: new Date().toISOString(),
            tool: 'meta_set_budget',
            entity,
            id,
            before,
            after,
            outcome: 'applied',
          },
          config,
        );

        return report(
          `Fatto: budget ${kind} di ${entity} "${current.name}" (${id}) portato da ` +
            `${formatMoney(currentMajor, account.currency)} a ${formatMoney(requested, account.currency)}.`,
          { before, after },
        );
      }),
  );
}
