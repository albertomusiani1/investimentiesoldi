#!/usr/bin/env node
/**
 * Entrypoint remoto per Node (Fly.io, Railway, Render, VPS).
 *
 * Espone MCP su HTTP in modalita' stateless, protetto da un bearer token:
 * senza MCP_AUTH_TOKEN il server non parte, perche' un endpoint aperto
 * equivarrebbe a lasciare le chiavi dell'account pubblicitario su internet.
 */
import { createServer as createHttpServer, type IncomingMessage } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { loadDotEnv } from './dotenv.js';
import { createServer } from './server.js';

loadDotEnv();

const PORT = Number(process.env.PORT ?? 8787);
const PATHNAME = process.env.MCP_PATH ?? '/mcp';
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN?.trim();

if (!AUTH_TOKEN) {
  console.error(
    '[mcp-ads] MCP_AUTH_TOKEN non impostato. In modalita\' HTTP e\' obbligatorio: ' +
      'genera un valore casuale (openssl rand -hex 32) e impostalo come secret.',
  );
  process.exit(1);
}
if (AUTH_TOKEN.length < 32) {
  console.error('[mcp-ads] MCP_AUTH_TOKEN troppo corto: usa almeno 32 caratteri casuali.');
  process.exit(1);
}

/** Confronto a tempo costante, per non far dedurre il token dai tempi di risposta. */
function tokenMatches(provided: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(AUTH_TOKEN!);
  return a.length === b.length && timingSafeEqual(a, b);
}

function isAuthorized(req: IncomingMessage): boolean {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return false;
  return tokenMatches(header.slice('Bearer '.length).trim());
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const httpServer = createHttpServer((req, res) => {
  void (async () => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' }).end('{"status":"ok"}');
      return;
    }

    if (url.pathname !== PATHNAME) {
      res.writeHead(404, { 'content-type': 'application/json' }).end('{"error":"not found"}');
      return;
    }

    if (!isAuthorized(req)) {
      res
        .writeHead(401, { 'content-type': 'application/json', 'www-authenticate': 'Bearer' })
        .end('{"error":"unauthorized"}');
      return;
    }

    // Un server e un trasporto nuovi per richiesta: nessuno stato condiviso fra chiamate.
    const server = createServer(process.env);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => {
      void transport.close();
      void server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, await readBody(req));
    } catch (error) {
      console.error(`[mcp-ads] richiesta fallita: ${error instanceof Error ? error.message : String(error)}`);
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'application/json' }).end('{"error":"internal error"}');
      }
    }
  })();
});

httpServer.listen(PORT, () => {
  console.error(`[mcp-ads] in ascolto su http://0.0.0.0:${PORT}${PATHNAME}`);
});
