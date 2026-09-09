/**
 * Entrypoint per Cloudflare Workers.
 *
 * Qui le variabili arrivano dai secret del Worker, non da process.env:
 * l'oggetto `env` viene passato tale e quale alla logica condivisa.
 */
import type { Env } from './config.js';
import { handleMcpRequest } from './remote.js';

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleMcpRequest(request, env);
  },
};
