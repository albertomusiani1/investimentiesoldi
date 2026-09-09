/**
 * Entrypoint remoto per Cloudflare Workers.
 *
 * Stessa logica degli altri entrypoint: cambia solo il guscio, perche' qui
 * le variabili arrivano dai secret del Worker e non da process.env.
 */
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer } from './server.js';

interface WorkerEnv extends Record<string, string | undefined> {
  MCP_AUTH_TOKEN?: string;
  MCP_PATH?: string;
}

/** Confronto a tempo costante senza dipendere da node:crypto. */
function tokenMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);
    const pathname = env.MCP_PATH ?? '/mcp';

    if (url.pathname === '/health') return json(200, { status: 'ok' });
    if (url.pathname !== pathname) return json(404, { error: 'not found' });

    const expected = env.MCP_AUTH_TOKEN?.trim();
    if (!expected || expected.length < 32) {
      return json(500, { error: 'MCP_AUTH_TOKEN non configurato o troppo corto' });
    }

    const header = request.headers.get('authorization');
    if (!header?.startsWith('Bearer ') || !tokenMatches(header.slice('Bearer '.length).trim(), expected)) {
      return json(401, { error: 'unauthorized' });
    }

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
    }
  },
};
