import { azienda, indirizzoCompleto } from './azienda';
import { t } from '../i18n';

/**
 * Costruttori dei blocchi JSON-LD usati dal componente SEO.
 * Tenerli qui evita di ripetere gli stessi oggetti in ogni pagina.
 */

export interface VoceBriciola {
  etichetta: string;
  href?: string;
}

export function schemaAttivita(site: URL): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': new URL('/#attivita', site).href,
    name: azienda.nomeLegale,
    alternateName: azienda.nome,
    description: t('home.metaDescrizione'),
    url: site.href,
    logo: new URL('/favicon.svg', site).href,
    image: new URL('/og-default.png', site).href,
    email: azienda.email,
    telephone: azienda.telefono,
    foundingDate: azienda.fondazione,
    vatID: azienda.datiSocietari.partitaIva,
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: azienda.dipendenti,
    },
    // Via, CAP, coordinate e orari non sono ancora stati forniti: meglio un
    // dato in meno che un dato inventato, che qui finirebbe dritto nelle
    // schede di Google.
    address: {
      '@type': 'PostalAddress',
      ...(azienda.indirizzo.via ? { streetAddress: azienda.indirizzo.via } : {}),
      ...(azienda.indirizzo.cap ? { postalCode: azienda.indirizzo.cap } : {}),
      addressLocality: azienda.indirizzo.citta,
      addressRegion: azienda.indirizzo.provincia,
      addressCountry: azienda.indirizzo.nazione,
    },
    areaServed: 'Italia',
    knowsLanguage: ['it'],
    slogan: t('sito.payoff'),
  };
}

export function schemaBriciole(voci: VoceBriciola[], site: URL): Record<string, unknown> {
  const tutte: VoceBriciola[] = [{ etichetta: t('nav.home'), href: '/' }, ...voci];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: tutte.map((voce, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: voce.etichetta,
      ...(voce.href ? { item: new URL(voce.href, site).href } : {}),
    })),
  };
}

export interface DatiOperaProgetto {
  titolo: string;
  descrizioneBreve: string;
  cliente: string;
  categoria: string;
  data: Date;
  immagine: string;
  percorso: string;
}

export function schemaProgetto(dati: DatiOperaProgetto, site: URL): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': new URL(dati.percorso, site).href,
    name: dati.titolo,
    headline: dati.titolo,
    description: dati.descrizioneBreve,
    url: new URL(dati.percorso, site).href,
    image: new URL(dati.immagine, site).href,
    genre: dati.categoria,
    dateCreated: dati.data.toISOString().slice(0, 10),
    datePublished: dati.data.toISOString().slice(0, 10),
    inLanguage: 'it',
    creator: {
      '@type': 'Organization',
      name: azienda.nomeLegale,
      url: site.href,
      address: indirizzoCompleto,
    },
    about: dati.cliente,
  };
}
