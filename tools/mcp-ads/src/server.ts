/**
 * Costruzione del server MCP.
 *
 * Questo file non sa nulla di come il server verra' raggiunto: il trasporto
 * lo scelgono gli entrypoint (stdio.ts in locale, http.ts o worker.ts online).
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadMetaConfig, type Env } from './config.js';
import { registerMetaTools } from './meta/tools.js';

export const SERVER_NAME = 'investimentiesoldi-ads';
export const SERVER_VERSION = '0.1.0';

export function createServer(env: Env): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        'Tool per leggere e modificare gli account pubblicitari Meta. ' +
        'I tool di scrittura (meta_set_status, meta_set_budget) applicano la modifica solo con confirm=true: ' +
        'chiamali prima senza confirm, mostra l\'anteprima all\'utente e attendi il suo assenso esplicito ' +
        'prima di richiamarli con confirm=true. Non impostare mai confirm=true di tua iniziativa.',
    },
  );

  registerMetaTools(server, loadMetaConfig(env));
  return server;
}
