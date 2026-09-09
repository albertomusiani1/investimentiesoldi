/**
 * Client minimale per la Meta Marketing API (Graph API).
 *
 * Volutamente basato su `fetch` e senza SDK: lo stesso file gira su Node
 * e su Cloudflare Workers senza modifiche.
 */
import type { MetaConfig } from '../config.js';

const GRAPH_BASE = 'https://graph.facebook.com';

/** Errore restituito da Meta, con i campi che servono per capire cosa e' andato storto. */
export class MetaApiError extends Error {
  readonly status: number;
  readonly code?: number;
  readonly subcode?: number;
  readonly type?: string;
  readonly userMessage?: string;
  readonly traceId?: string;

  constructor(
    message: string,
    details: {
      status: number;
      code?: number;
      subcode?: number;
      type?: string;
      userMessage?: string;
      traceId?: string;
    },
  ) {
    super(message);
    this.name = 'MetaApiError';
    this.status = details.status;
    this.code = details.code;
    this.subcode = details.subcode;
    this.type = details.type;
    this.userMessage = details.userMessage;
    this.traceId = details.traceId;
  }

  /** Messaggio pensato per essere letto da una persona, non da un log. */
  describe(): string {
    const parts = [this.userMessage || this.message];
    const meta: string[] = [];
    if (this.code !== undefined) meta.push(`code ${this.code}`);
    if (this.subcode !== undefined) meta.push(`subcode ${this.subcode}`);
    if (this.type) meta.push(this.type);
    if (this.traceId) meta.push(`trace ${this.traceId}`);
    if (meta.length > 0) parts.push(`(${meta.join(', ')})`);
    if (this.code === 190) {
      parts.push('\nIl token e\' scaduto o revocato: rigenera il System User token nel Business Manager.');
    }
    if (this.code === 200 || this.code === 3) {
      parts.push('\nAl token mancano i permessi necessari (ads_read per leggere, ads_management per modificare).');
    }
    if (this.code === 17 || this.code === 80004) {
      parts.push('\nLimite di frequenza raggiunto: attendi qualche minuto prima di riprovare.');
    }
    return parts.join(' ');
  }
}

/** Quota consumata sull'ad account, se Meta la comunica negli header. */
export interface UsageWarning {
  header: string;
  detail: string;
}

export interface PagedResult<T> {
  data: T[];
  /** Presente se Meta ha altre pagine e abbiamo raggiunto il limite di pagine richiesto. */
  truncated: boolean;
  usage: UsageWarning[];
}

type Params = Record<string, string | number | boolean | undefined | null | string[]>;

function encodeParams(params: Params): URLSearchParams {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.set(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
  }
  return search;
}

/** Estrae le percentuali di quota consumata, per avvisare prima di sbattere sul rate limit. */
function readUsage(headers: Headers): UsageWarning[] {
  const warnings: UsageWarning[] = [];
  for (const header of ['x-business-use-case-usage', 'x-ad-account-usage', 'x-app-usage']) {
    const raw = headers.get(header);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      const percentages: number[] = [];
      const collect = (node: unknown): void => {
        if (Array.isArray(node)) {
          node.forEach(collect);
        } else if (node && typeof node === 'object') {
          for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
            if (typeof value === 'number' && /util|pct|percent/i.test(key)) percentages.push(value);
            else collect(value);
          }
        }
      };
      collect(parsed);
      const peak = percentages.length > 0 ? Math.max(...percentages) : 0;
      if (peak >= 75) warnings.push({ header, detail: `quota al ${peak}%` });
    } catch {
      // Header non parsabile: non e' un motivo per far fallire la chiamata.
    }
  }
  return warnings;
}

export class MetaClient {
  constructor(private readonly config: MetaConfig) {}

  private url(path: string): string {
    const clean = path.startsWith('/') ? path.slice(1) : path;
    return `${GRAPH_BASE}/${this.config.apiVersion}/${clean}`;
  }

  private async parse(response: Response): Promise<unknown> {
    const text = await response.text();
    let body: unknown;
    try {
      body = text.length > 0 ? JSON.parse(text) : {};
    } catch {
      throw new MetaApiError(`Risposta non JSON da Meta (HTTP ${response.status}): ${text.slice(0, 300)}`, {
        status: response.status,
      });
    }

    const error = (body as { error?: Record<string, unknown> }).error;
    if (error) {
      throw new MetaApiError(String(error.message ?? 'errore Meta sconosciuto'), {
        status: response.status,
        code: typeof error.code === 'number' ? error.code : undefined,
        subcode: typeof error.error_subcode === 'number' ? error.error_subcode : undefined,
        type: typeof error.type === 'string' ? error.type : undefined,
        userMessage: typeof error.error_user_msg === 'string' ? error.error_user_msg : undefined,
        traceId: typeof error.fbtrace_id === 'string' ? error.fbtrace_id : undefined,
      });
    }

    if (!response.ok) {
      throw new MetaApiError(`HTTP ${response.status} da Meta: ${text.slice(0, 300)}`, {
        status: response.status,
      });
    }

    return body;
  }

  /** GET su un nodo singolo. */
  async get<T>(path: string, params: Params = {}): Promise<T> {
    const search = encodeParams({ ...params, access_token: this.config.accessToken });
    const response = await fetch(`${this.url(path)}?${search.toString()}`, {
      method: 'GET',
      headers: { accept: 'application/json' },
    });
    return (await this.parse(response)) as T;
  }

  /** GET su una edge paginata, seguendo `paging.next` fino a `maxPages`. */
  async getPaged<T>(path: string, params: Params = {}, maxPages = 5): Promise<PagedResult<T>> {
    const search = encodeParams({ ...params, access_token: this.config.accessToken });
    let next: string | null = `${this.url(path)}?${search.toString()}`;
    const data: T[] = [];
    const usage: UsageWarning[] = [];
    let pages = 0;

    while (next && pages < maxPages) {
      const response = await fetch(next, { method: 'GET', headers: { accept: 'application/json' } });
      usage.push(...readUsage(response.headers));
      const body = (await this.parse(response)) as {
        data?: T[];
        paging?: { next?: string };
      };
      if (body.data) data.push(...body.data);
      next = body.paging?.next ?? null;
      pages += 1;
    }

    return { data, truncated: next !== null, usage };
  }

  /** POST su un nodo: usato per aggiornare stato e budget. */
  async post<T>(path: string, body: Params = {}): Promise<T> {
    const payload = encodeParams({ ...body, access_token: this.config.accessToken });
    const response = await fetch(this.url(path), {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });
    return (await this.parse(response)) as T;
  }
}
