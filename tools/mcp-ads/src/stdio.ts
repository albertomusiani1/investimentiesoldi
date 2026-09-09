#!/usr/bin/env node
/**
 * Entrypoint locale: Claude Code avvia questo processo e gli parla su stdin/stdout.
 * Nessuna porta aperta, nessun URL pubblico, credenziali dal .env locale.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadDotEnv } from './dotenv.js';
import { createServer } from './server.js';

async function main(): Promise<void> {
  // stdout e' riservato al protocollo MCP: ogni log deve andare su stderr.
  const envFile = loadDotEnv();
  if (envFile) console.error(`[mcp-ads] configurazione da ${envFile}`);

  const server = createServer(process.env);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[mcp-ads] server avviato su stdio');
}

main().catch((error: unknown) => {
  console.error(`[mcp-ads] avvio fallito: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
