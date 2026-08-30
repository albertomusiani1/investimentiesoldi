// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Indirizzo pubblico del sito. Da qui escono gli URL canonici, le anteprime
 * social, la sitemap e il robots.txt: se è sbagliato, il sito è online ma
 * "si presenta" con un indirizzo che non esiste.
 *
 * Come viene scelto, in ordine:
 *   1. la variabile SITE_URL, se la imposti tu esplicitamente;
 *   2. la variabile URL, che Netlify valorizza da sola con l'indirizzo del
 *      sito durante la build — così un deploy di prova su xxx.netlify.app
 *      è già coerente senza che tu debba toccare niente;
 *   3. il dominio definitivo scritto qui sotto, usato in sviluppo locale.
 *
 * QUANDO COMPRI IL DOMINIO VERO: sostituisci l'indirizzo in DOMINIO_DEFINITIVO
 * e, su Netlify, collega il dominio: la variabile URL si aggiorna da sola.
 */
const DOMINIO_DEFINITIVO = 'https://www.brambillafuture.it';

/**
 * Accetta solo indirizzi http/https: una variabile sporca non deve rompere la build.
 * @param {unknown} valore
 * @returns {string | undefined}
 */
const indirizzoValido = (valore) =>
  typeof valore === 'string' && /^https?:\/\/[^\s]+$/.test(valore) ? valore.replace(/\/$/, '') : undefined;

export const SITE_URL =
  indirizzoValido(process.env.SITE_URL) ??
  indirizzoValido(process.env.URL) ??
  DOMINIO_DEFINITIVO;

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  build: {
    // Nessun foglio di stile inline: permette una Content-Security-Policy
    // con style-src 'self', senza 'unsafe-inline'.
    inlineStylesheets: 'never',
  },
  i18n: {
    defaultLocale: 'it',
    locales: ['it'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    build: {
      // Nessuna risorsa inline: lo script del modulo contatti viene emesso
      // come file esterno, così la CSP può restare senza 'unsafe-inline'.
      assetsInlineLimit: 0,
    },
  },
  integrations: [
    sitemap({
      // Le pagine con noindex non devono finire in sitemap.
      filter: (page) =>
        !['/404', '/contatti/grazie', '/contatti/errore'].some((escluso) =>
          page.replace(/\/$/, '').endsWith(escluso)
        ),
    }),
  ],
});
