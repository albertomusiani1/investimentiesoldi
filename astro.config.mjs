// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * URL pubblica del sito. Va sostituita con il dominio reale prima del deploy:
 * viene usata per canonical, Open Graph, sitemap e robots.txt.
 */
export const SITE_URL = 'https://www.brambillafuture.it';

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
