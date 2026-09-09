/**
 * Gestione di una richiesta MCP su HTTP, in forma indipendente dal provider.
 *
 * Usa solo `Request`/`Response` standard, quindi lo stesso file serve
 * Cloudflare Workers, Netlify Functions e qualunque runtime web-standard.
 * L'entrypoint Node (`http.ts`) usa invece il trasporto Node dell'SDK.
 */
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import type { Env } from './config.js';
import { createServer } from './server.js';

/** Lunghezza minima del token dell'endpoint: sotto questa soglia il server si rifiuta di rispondere. */
export const MIN_AUTH_TOKEN_LENGTH = 32;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Confronto a tempo costante, senza dipendere da node:crypto.
 * Confronta prima gli hash delle lunghezze per non rivelare nulla dai tempi.
 */
function tokenMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function handleMcpRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const pathname = env.MCP_PATH ?? '/mcp';

  // Endpoint di servizio: utile per verificare che il deploy sia vivo,
  // senza esporre nulla e senza richiedere autenticazione.
  if (url.pathname === '/health') {
    return json(200, { status: 'ok' });
  }

  if (url.pathname !== pathname) {
    return json(404, { error: 'not found' });
  }

  const expected = env.MCP_AUTH_TOKEN?.trim();
  if (!expected || expected.length < MIN_AUTH_TOKEN_LENGTH) {
    // Un endpoint MCP senza autenticazione equivarrebbe a pubblicare le chiavi
    // dell'account pubblicitario: meglio un errore chiaro che un server aperto.
    console.error('[mcp-ads] MCP_AUTH_TOKEN mancante o troppo corto: richiesta rifiutata');
    return json(500, {
      error: `MCP_AUTH_TOKEN non configurato o piu' corto di ${MIN_AUTH_TOKEN_LENGTH} caratteri`,
    });
  }

  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ') || !tokenMatches(header.slice('Bearer '.length).trim(), expected)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json', 'www-authenticate': 'Bearer' },
    });
  }

  // Un server e un trasporto nuovi per richiesta: nessuno stato condiviso fra chiamate.
  const server = createServer(env);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    return await transport.handleRequest(request);
  } catch (error) {
    console.error(`[mcp-ads] richiesta fallita: ${error instanceof Error ? error.message : String(error)}`);
    return json(500, { error: 'internal error' });
  } finally {
    await transport.close().catch(() => undefined);
    await server.close().catch(() => undefined);
  }
}
