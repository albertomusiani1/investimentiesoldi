/**
 * Funzione che riceve il modulo contatti.
 *
 * Responsabilità:
 *  1. validare i dati lato server (il client non è affidabile);
 *  2. scartare in silenzio le compilazioni automatiche (honeypot);
 *  3. limitare le richieste per indirizzo IP;
 *  4. verificare il token antispam quando è presente;
 *  5. inviare la conferma al visitatore e la notifica al titolare;
 *  6. rispondere in JSON alle richieste dell'isola JavaScript e con un
 *     redirect a quelle inviate dal browser senza JavaScript.
 *
 * Questo file non conosce il fornitore di posta: usa solo l'interfaccia
 * esportata da `lib/mailer.ts`.
 */
import {
  ConfigurazioneMancante,
  creaMailer,
  leggiVariabileFacoltativa,
  leggiVariabileObbligatoria,
  type Mailer,
} from './lib/mailer.ts';

// ---------------------------------------------------------------------------
// Costanti di validazione
// ---------------------------------------------------------------------------
export const LIMITI = {
  nomeMin: 2,
  nomeMax: 80,
  emailMax: 180,
  aziendaMax: 120,
  messaggioMin: 10,
  messaggioMax: 4000,
} as const;

/** Finestra e soglia del limitatore di frequenza per indirizzo IP. */
export const FINESTRA_MS = 15 * 60 * 1000;
export const MAX_RICHIESTE = 5;
/** Soglia più severa quando la richiesta arriva senza token antispam. */
export const MAX_RICHIESTE_SENZA_TOKEN = 1;

const ENDPOINT_VERIFICA_ANTISPAM = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const PERCORSO_CONFERMA = '/contatti/grazie';
const PERCORSO_ERRORE = '/contatti/errore';

/** Espressione volutamente permissiva: valida la forma, non l'esistenza. */
const FORMA_EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export type CodiceEsito =
  | 'ok'
  | 'validazione'
  | 'antispam'
  | 'troppe-richieste'
  | 'invio'
  | 'configurazione'
  | 'metodo';

export interface DatiContatto {
  nome: string;
  email: string;
  azienda: string;
  messaggio: string;
  consenso: boolean;
  honeypot: string;
  token: string;
}

export interface Limitatore {
  /** true se la richiesta è ammessa, false se la soglia è stata superata. */
  consenti(chiave: string, massimo: number): boolean;
}

export interface Dipendenze {
  mailer: Mailer;
  /** Verifica del token antispam: true se il token è valido. */
  verificaAntispam: (token: string, ip: string) => Promise<boolean>;
  limitatore: Limitatore;
  /** Sovrascrivibile nei test per non dipendere dall'ambiente. */
  ambiente?: {
    destinatario: string;
    nomeMittente: string;
  };
}

// ---------------------------------------------------------------------------
// Limitatore di frequenza in memoria
// ---------------------------------------------------------------------------
export function creaLimitatore(finestraMs: number = FINESTRA_MS, ora: () => number = Date.now): Limitatore {
  const registro = new Map<string, number[]>();

  return {
    consenti(chiave: string, massimo: number): boolean {
      const adesso = ora();
      const precedenti = (registro.get(chiave) ?? []).filter((t) => adesso - t < finestraMs);

      // Pulizia opportunistica: evita che la mappa cresca senza limite.
      if (registro.size > 5000) registro.clear();

      if (precedenti.length >= massimo) {
        registro.set(chiave, precedenti);
        return false;
      }

      precedenti.push(adesso);
      registro.set(chiave, precedenti);
      return true;
    },
  };
}

// ---------------------------------------------------------------------------
// Lettura e validazione dei dati
// ---------------------------------------------------------------------------
function testo(valore: FormDataEntryValue | null | undefined): string {
  return typeof valore === 'string' ? valore.trim() : '';
}

export async function leggiDati(request: Request): Promise<DatiContatto> {
  const tipo = request.headers.get('content-type') ?? '';
  let campi: Record<string, string> = {};

  if (tipo.includes('application/json')) {
    const grezzo: unknown = await request.json().catch(() => ({}));
    const oggetto = (grezzo ?? {}) as Record<string, unknown>;
    for (const [chiave, valore] of Object.entries(oggetto)) {
      campi[chiave] = typeof valore === 'string' ? valore.trim() : valore === true ? 'on' : '';
    }
  } else {
    const modulo = await request.formData();
    campi = Object.fromEntries(
      [...modulo.entries()].map(([chiave, valore]) => [chiave, testo(valore)])
    );
  }

  return {
    nome: campi['nome'] ?? '',
    email: campi['email'] ?? '',
    azienda: campi['azienda'] ?? '',
    messaggio: campi['messaggio'] ?? '',
    consenso: campi['consenso'] === 'on' || campi['consenso'] === 'true',
    honeypot: campi['sito_web'] ?? '',
    token: campi['cf-turnstile-response'] ?? '',
  };
}

/** Restituisce l'elenco dei campi non validi; vuoto se i dati vanno bene. */
export function validaDati(dati: DatiContatto): string[] {
  const errori: string[] = [];

  if (dati.nome.length < LIMITI.nomeMin || dati.nome.length > LIMITI.nomeMax) errori.push('nome');
  if (dati.email.length > LIMITI.emailMax || !FORMA_EMAIL.test(dati.email)) errori.push('email');
  if (dati.azienda.length > LIMITI.aziendaMax) errori.push('azienda');
  if (
    dati.messaggio.length < LIMITI.messaggioMin ||
    dati.messaggio.length > LIMITI.messaggioMax
  ) {
    errori.push('messaggio');
  }
  if (!dati.consenso) errori.push('consenso');

  return errori;
}

// ---------------------------------------------------------------------------
// Verifica antispam (Cloudflare Turnstile)
// ---------------------------------------------------------------------------
export async function verificaAntispamReale(token: string, ip: string): Promise<boolean> {
  const segreto = leggiVariabileObbligatoria('TURNSTILE_SECRET_KEY');

  const corpo = new URLSearchParams({ secret: segreto, response: token });
  if (ip) corpo.set('remoteip', ip);

  try {
    const risposta = await fetch(ENDPOINT_VERIFICA_ANTISPAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: corpo,
      signal: AbortSignal.timeout(8000),
    });
    if (!risposta.ok) return false;
    const esito = (await risposta.json()) as { success?: boolean };
    return esito.success === true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Composizione delle email
// ---------------------------------------------------------------------------
export function proteggiHtml(valore: string): string {
  return valore
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function paragrafiHtml(testoGrezzo: string): string {
  return testoGrezzo
    .split(/\n{2,}/)
    .map((blocco) => `<p>${proteggiHtml(blocco).replaceAll('\n', '<br>')}</p>`)
    .join('\n');
}

export function emailConferma(dati: DatiContatto, nomeMittente: string) {
  const oggetto = `Abbiamo ricevuto la tua richiesta — ${nomeMittente}`;

  const text = [
    `Gentile ${dati.nome},`,
    '',
    `abbiamo ricevuto la sua richiesta e le risponderemo entro due giorni lavorativi.`,
    'Di seguito il riepilogo di quanto ci ha scritto.',
    '',
    `Nome: ${dati.nome}`,
    `Email: ${dati.email}`,
    dati.azienda ? `Azienda: ${dati.azienda}` : 'Azienda: non indicata',
    '',
    'Messaggio:',
    dati.messaggio,
    '',
    `Cordiali saluti,`,
    nomeMittente,
  ].join('\n');

  const html = [
    `<p>Gentile ${proteggiHtml(dati.nome)},</p>`,
    '<p>abbiamo ricevuto la sua richiesta e le risponderemo entro due giorni lavorativi. Di seguito il riepilogo di quanto ci ha scritto.</p>',
    '<hr>',
    `<p><strong>Nome:</strong> ${proteggiHtml(dati.nome)}<br>`,
    `<strong>Email:</strong> ${proteggiHtml(dati.email)}<br>`,
    `<strong>Azienda:</strong> ${proteggiHtml(dati.azienda || 'non indicata')}</p>`,
    '<p><strong>Messaggio:</strong></p>',
    paragrafiHtml(dati.messaggio),
    '<hr>',
    `<p>Cordiali saluti,<br>${proteggiHtml(nomeMittente)}</p>`,
  ].join('\n');

  return { oggetto, text, html };
}

export function emailNotifica(dati: DatiContatto, ip: string) {
  const oggetto = `Nuova richiesta dal sito — ${dati.nome}`;

  const text = [
    'Nuova richiesta inviata dal modulo contatti del sito.',
    '',
    `Nome: ${dati.nome}`,
    `Email: ${dati.email}`,
    `Azienda: ${dati.azienda || 'non indicata'}`,
    `Indirizzo IP: ${ip || 'non disponibile'}`,
    `Ricevuta il: ${new Date().toISOString()}`,
    '',
    'Messaggio:',
    dati.messaggio,
  ].join('\n');

  const html = [
    '<p>Nuova richiesta inviata dal modulo contatti del sito.</p>',
    `<p><strong>Nome:</strong> ${proteggiHtml(dati.nome)}<br>`,
    `<strong>Email:</strong> <a href="mailto:${proteggiHtml(dati.email)}">${proteggiHtml(dati.email)}</a><br>`,
    `<strong>Azienda:</strong> ${proteggiHtml(dati.azienda || 'non indicata')}<br>`,
    `<strong>Indirizzo IP:</strong> ${proteggiHtml(ip || 'non disponibile')}<br>`,
    `<strong>Ricevuta il:</strong> ${new Date().toISOString()}</p>`,
    '<hr>',
    paragrafiHtml(dati.messaggio),
  ].join('\n');

  return { oggetto, text, html };
}

// ---------------------------------------------------------------------------
// Risposte
// ---------------------------------------------------------------------------
function vuoleJson(request: Request): boolean {
  const accetta = request.headers.get('accept') ?? '';
  const tipo = request.headers.get('content-type') ?? '';
  return accetta.includes('application/json') || tipo.includes('application/json');
}

function rispondi(
  request: Request,
  stato: number,
  corpo: Record<string, unknown> & { codice: CodiceEsito }
): Response {
  if (vuoleJson(request)) {
    return new Response(JSON.stringify(corpo), {
      status: stato,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  const destinazione =
    corpo.codice === 'ok' ? PERCORSO_CONFERMA : `${PERCORSO_ERRORE}?codice=${corpo.codice}`;

  return new Response(null, {
    status: 303,
    headers: { Location: destinazione, 'Cache-Control': 'no-store' },
  });
}

function indirizzoIp(request: Request): string {
  const diretto = request.headers.get('x-nf-client-connection-ip');
  if (diretto) return diretto;
  const inoltrato = request.headers.get('x-forwarded-for');
  if (inoltrato) return (inoltrato.split(',')[0] ?? '').trim();
  return '';
}

// ---------------------------------------------------------------------------
// Gestore
// ---------------------------------------------------------------------------
export function creaGestore(dipendenze: Dipendenze) {
  return async function gestore(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return rispondi(request, 405, { codice: 'metodo' });
    }

    // 1. Configurazione: se manca una variabile obbligatoria si fallisce
    //    subito con un messaggio che la nomina.
    let destinatario: string;
    let nomeMittente: string;
    try {
      destinatario = dipendenze.ambiente?.destinatario ?? leggiVariabileObbligatoria('CONTACT_TO_EMAIL');
      nomeMittente = dipendenze.ambiente?.nomeMittente ?? leggiVariabileObbligatoria('CONTACT_FROM_NAME');
      dipendenze.mailer.verificaConfigurazione();
    } catch (errore) {
      const dettaglio =
        errore instanceof ConfigurazioneMancante
          ? errore.message
          : errore instanceof Error
            ? errore.message
            : String(errore);
      console.error('[contatti] configurazione incompleta:', dettaglio);
      return rispondi(request, 500, { codice: 'configurazione', dettaglio });
    }

    const dati = await leggiDati(request).catch(() => null);
    if (dati === null) {
      return rispondi(request, 400, { codice: 'validazione', campi: ['messaggio'] });
    }

    // 2. Honeypot: campo nascosto compilato solo dai programmi automatici.
    //    Si risponde 200 fingendo successo, senza inviare nulla.
    if (dati.honeypot !== '') {
      console.warn('[contatti] richiesta scartata: honeypot compilato');
      return rispondi(request, 200, { codice: 'ok' });
    }

    // 3. Limite di frequenza per indirizzo IP.
    const ip = indirizzoIp(request);
    const massimo = dati.token === '' ? MAX_RICHIESTE_SENZA_TOKEN : MAX_RICHIESTE;
    if (!dipendenze.limitatore.consenti(ip || 'sconosciuto', massimo)) {
      return rispondi(request, 429, { codice: 'troppe-richieste' });
    }

    // 4. Validazione dei dati.
    const errori = validaDati(dati);
    if (errori.length > 0) {
      return rispondi(request, 400, { codice: 'validazione', campi: errori });
    }

    // 5. Verifica antispam. Il token esiste solo se il visitatore ha
    //    JavaScript attivo: senza token vale il limite più severo del punto 3.
    if (dati.token !== '') {
      const valido = await dipendenze.verificaAntispam(dati.token, ip);
      if (!valido) {
        return rispondi(request, 403, { codice: 'antispam' });
      }
    }

    // 6. Invio delle due email.
    const conferma = emailConferma(dati, nomeMittente);
    const notifica = emailNotifica(dati, ip);

    const [esitoNotifica, esitoConferma] = await Promise.all([
      dipendenze.mailer.inviaEmail({
        to: destinatario,
        toName: nomeMittente,
        subject: notifica.oggetto,
        text: notifica.text,
        html: notifica.html,
        replyTo: dati.email,
        replyToName: dati.nome,
      }),
      dipendenze.mailer.inviaEmail({
        to: dati.email,
        toName: dati.nome,
        subject: conferma.oggetto,
        text: conferma.text,
        html: conferma.html,
        replyTo: destinatario,
        replyToName: nomeMittente,
      }),
    ]);

    // La notifica al titolare è quella che non deve andare persa: se fallisce
    // si registra l'intero contenuto nei log e si invita a scrivere a mano.
    if (!esitoNotifica.inviata) {
      console.error('[contatti] notifica al titolare non inviata:', esitoNotifica.errore);
      console.error('[contatti] contenuto da recuperare:', JSON.stringify({
        nome: dati.nome,
        email: dati.email,
        azienda: dati.azienda,
        messaggio: dati.messaggio,
        ricevutaIl: new Date().toISOString(),
      }));
      return rispondi(request, 502, { codice: 'invio', email: destinatario });
    }

    if (!esitoConferma.inviata) {
      // Il contatto è arrivato a destinazione: non è un errore per il visitatore.
      console.warn('[contatti] copia di conferma non inviata:', esitoConferma.errore);
    }

    return rispondi(request, 200, { codice: 'ok' });
  };
}

// ---------------------------------------------------------------------------
// Composizione di produzione
// ---------------------------------------------------------------------------
const limitatoreCondiviso = creaLimitatore();

export default async function handler(request: Request): Promise<Response> {
  const dipendenze: Dipendenze = {
    mailer: creaMailer(),
    verificaAntispam: verificaAntispamReale,
    limitatore: limitatoreCondiviso,
  };

  try {
    return await creaGestore(dipendenze)(request);
  } catch (errore) {
    const dettaglio = errore instanceof Error ? errore.message : String(errore);
    console.error('[contatti] errore non gestito:', dettaglio);
    const destinatarioDiCortesia = leggiVariabileFacoltativa('CONTACT_TO_EMAIL');
    return new Response(
      JSON.stringify({ codice: 'invio', email: destinatarioDiCortesia }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      }
    );
  }
}
