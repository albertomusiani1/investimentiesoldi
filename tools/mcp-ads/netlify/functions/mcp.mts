/**
 * Entrypoint per Netlify Functions (v2).
 *
 * Netlify usa `Request`/`Response` standard come Cloudflare, quindi delega
 * alla stessa logica condivisa; le variabili arrivano da process.env,
 * impostate in Site configuration -> Environment variables.
 *
 * Richiede `npm run build` prima del deploy (vedi netlify.toml).
 */
import { handleMcpRequest } from '../../dist/remote.js';

export default async (request: Request): Promise<Response> =>
  handleMcpRequest(request, process.env as Record<string, string | undefined>);

export const config = {
  path: ['/mcp', '/health'],
};
