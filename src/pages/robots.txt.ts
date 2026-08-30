import type { APIRoute } from 'astro';

/**
 * robots.txt generato alla build invece che scritto a mano.
 *
 * Il motivo: l'indirizzo della sitemap deve sempre coincidere con quello del
 * sito. Scritto a mano si dimentica; generato da `Astro.site` non può sbagliare,
 * né in locale, né su un deploy di prova, né sul dominio definitivo.
 *
 * Nota importante — perché qui NON c'è "Disallow: /".
 * Per tenere il sito fuori da Google si usa l'intestazione X-Robots-Tag
 * (vedi netlify.toml), non un divieto di scansione. Sono cose diverse:
 * "Disallow" dice ai motori di NON LEGGERE le pagine, e un motore che non
 * legge la pagina non può nemmeno vedere che gli stai chiedendo di non
 * indicizzarla — risultato, l'indirizzo può finire lo stesso nei risultati,
 * solo senza descrizione. La combinazione corretta è: lettura permessa,
 * indicizzazione negata.
 */
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('http://localhost:4321')).origin;

  const contenuto = `# ${base}
# Generato automaticamente alla build: non modificare a mano.
# Il blocco dell'indicizzazione non sta qui, ma nell'intestazione
# X-Robots-Tag definita in netlify.toml.

User-agent: *
Allow: /

# Pagine di servizio: nessun valore per l'indice.
Disallow: /contatti/grazie
Disallow: /contatti/errore

Sitemap: ${base}/sitemap-index.xml
`;

  return new Response(contenuto, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
