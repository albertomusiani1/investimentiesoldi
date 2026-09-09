/**
 * Test della funzione del modulo contatti.
 *
 * Girano con `npm test` senza chiavi reali: il mailer e la verifica
 * antispam sono sostituiti da doppi di prova iniettati in `creaGestore`.
 * Nessuna chiamata di rete viene eseguita.
 */
import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

import {
  creaGestore,
  creaLimitatore,
  MAX_RICHIESTE,
  validaDati,
  proteggiHtml,
  type DatiContatto,
  type Dipendenze,
} from '../netlify/functions/contact.ts';
import type { EsitoInvio, Mailer, MessaggioEmail } from '../netlify/functions/lib/mailer.ts';
import { ConfigurazioneMancante } from '../netlify/functions/lib/mailer.ts';

const AMBIENTE = { destinatario: 'titolare@esempio.it', nomeMittente: 'PROJECTUNE' };

interface MailerFinto extends Mailer {
  inviate: MessaggioEmail[];
}

function mailerFinto(esito: EsitoInvio = { inviata: true, identificativo: 'test' }): MailerFinto {
  const inviate: MessaggioEmail[] = [];
  return {
    inviate,
    verificaConfigurazione() {},
    async inviaEmail(messaggio: MessaggioEmail): Promise<EsitoInvio> {
      inviate.push(messaggio);
      return esito;
    },
  };
}

function dipendenze(sovrascritture: Partial<Dipendenze> = {}): Dipendenze & { mailer: MailerFinto } {
  const base = {
    mailer: mailerFinto(),
    verificaAntispam: async () => true,
    limitatore: creaLimitatore(),
    ambiente: AMBIENTE,
  };
  return { ...base, ...sovrascritture } as Dipendenze & { mailer: MailerFinto };
}

function richiesta(campi: Record<string, string>, intestazioni: Record<string, string> = {}): Request {
  const modulo = new FormData();
  for (const [chiave, valore] of Object.entries(campi)) modulo.set(chiave, valore);

  return new Request('https://esempio.it/api/contatti', {
    method: 'POST',
    headers: { Accept: 'application/json', 'x-nf-client-connection-ip': '203.0.113.7', ...intestazioni },
    body: modulo,
  });
}

const CAMPI_VALIDI = {
  nome: 'Maria Rossi',
  email: 'maria.rossi@azienda.it',
  azienda: 'Azienda S.p.A.',
  messaggio: 'Buongiorno, vorremmo una valutazione di fattibilità per una staffa in alluminio.',
  consenso: 'on',
  'cf-turnstile-response': 'token-di-prova',
};

describe('modulo contatti', () => {
  test('caso valido: risponde 200 e invia due email', async () => {
    const deps = dipendenze();
    const risposta = await creaGestore(deps)(richiesta(CAMPI_VALIDI));

    assert.equal(risposta.status, 200);
    const corpo = (await risposta.json()) as { codice: string };
    assert.equal(corpo.codice, 'ok');

    assert.equal(deps.mailer.inviate.length, 2, 'devono partire notifica e conferma');

    const notifica = deps.mailer.inviate.find((m) => m.to === AMBIENTE.destinatario);
    const conferma = deps.mailer.inviate.find((m) => m.to === CAMPI_VALIDI.email);

    assert.ok(notifica, 'manca la notifica al titolare');
    assert.ok(conferma, 'manca la conferma al visitatore');
    assert.equal(notifica.replyTo, CAMPI_VALIDI.email);
    assert.match(notifica.text, /Maria Rossi/);
    assert.match(notifica.text, /staffa in alluminio/);
    assert.match(conferma.text, /riepilogo|Messaggio/i);
    assert.match(conferma.text, /staffa in alluminio/);
  });

  test('email malformata: risponde 400 e non invia nulla', async () => {
    const deps = dipendenze();
    const risposta = await creaGestore(deps)(
      richiesta({ ...CAMPI_VALIDI, email: 'maria.rossi.azienda' })
    );

    assert.equal(risposta.status, 400);
    const corpo = (await risposta.json()) as { codice: string; campi: string[] };
    assert.equal(corpo.codice, 'validazione');
    assert.deepEqual(corpo.campi, ['email']);
    assert.equal(deps.mailer.inviate.length, 0);
  });

  test('consenso mancante: risponde 400 e non invia nulla', async () => {
    const deps = dipendenze();
    const campi = { ...CAMPI_VALIDI };
    delete (campi as Partial<typeof CAMPI_VALIDI>).consenso;

    const risposta = await creaGestore(deps)(richiesta(campi));

    assert.equal(risposta.status, 400);
    const corpo = (await risposta.json()) as { codice: string; campi: string[] };
    assert.equal(corpo.codice, 'validazione');
    assert.deepEqual(corpo.campi, ['consenso']);
    assert.equal(deps.mailer.inviate.length, 0);
  });

  test('honeypot pieno: finge successo con 200 ma non invia nulla', async () => {
    const deps = dipendenze();
    const risposta = await creaGestore(deps)(
      richiesta({ ...CAMPI_VALIDI, sito_web: 'https://spam.example' })
    );

    assert.equal(risposta.status, 200);
    const corpo = (await risposta.json()) as { codice: string };
    assert.equal(corpo.codice, 'ok');
    assert.equal(deps.mailer.inviate.length, 0, 'la richiesta va scartata in silenzio');
  });

  test('token antispam non valido: risponde 403 e non invia nulla', async () => {
    const deps = dipendenze({ verificaAntispam: async () => false });
    const risposta = await creaGestore(deps)(richiesta(CAMPI_VALIDI));

    assert.equal(risposta.status, 403);
    const corpo = (await risposta.json()) as { codice: string };
    assert.equal(corpo.codice, 'antispam');
    assert.equal(deps.mailer.inviate.length, 0);
  });

  test('invio email fallito: risponde 502 e indica l\'indirizzo a cui scrivere', async () => {
    const deps = dipendenze({
      mailer: mailerFinto({ inviata: false, errore: 'servizio non raggiungibile', stato: 503 }),
    });
    const risposta = await creaGestore(deps)(richiesta(CAMPI_VALIDI));

    assert.equal(risposta.status, 502);
    const corpo = (await risposta.json()) as { codice: string; email: string };
    assert.equal(corpo.codice, 'invio');
    assert.equal(corpo.email, AMBIENTE.destinatario, 'il visitatore deve ricevere un recapito utile');
  });

  test('variabile d\'ambiente mancante: risponde 500 nominando la variabile', async () => {
    const mailer = mailerFinto();
    mailer.verificaConfigurazione = () => {
      throw new ConfigurazioneMancante('MAILER_API_KEY');
    };

    const risposta = await creaGestore(dipendenze({ mailer }))(richiesta(CAMPI_VALIDI));

    assert.equal(risposta.status, 500);
    const corpo = (await risposta.json()) as { codice: string; dettaglio: string };
    assert.equal(corpo.codice, 'configurazione');
    assert.match(corpo.dettaglio, /MAILER_API_KEY/);
  });

  test('limite di frequenza: oltre la soglia risponde 429', async () => {
    const deps = dipendenze();
    const gestore = creaGestore(deps);

    for (let tentativo = 0; tentativo < MAX_RICHIESTE; tentativo += 1) {
      const ok = await gestore(richiesta(CAMPI_VALIDI));
      assert.equal(ok.status, 200, `tentativo ${tentativo + 1} doveva passare`);
    }

    const bloccata = await gestore(richiesta(CAMPI_VALIDI));
    assert.equal(bloccata.status, 429);
    const corpo = (await bloccata.json()) as { codice: string };
    assert.equal(corpo.codice, 'troppe-richieste');
  });

  test('senza JavaScript: risponde con un redirect verso la pagina di conferma', async () => {
    const deps = dipendenze();
    const modulo = new FormData();
    for (const [chiave, valore] of Object.entries(CAMPI_VALIDI)) modulo.set(chiave, valore);

    const risposta = await creaGestore(deps)(
      new Request('https://esempio.it/api/contatti', {
        method: 'POST',
        headers: { Accept: 'text/html', 'x-nf-client-connection-ip': '198.51.100.4' },
        body: modulo,
      })
    );

    assert.equal(risposta.status, 303);
    assert.equal(risposta.headers.get('location'), '/contatti/grazie');
  });

  test('metodo diverso da POST: risponde 405', async () => {
    const risposta = await creaGestore(dipendenze())(
      new Request('https://esempio.it/api/contatti', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
    );
    assert.equal(risposta.status, 405);
  });
});

describe('validazione dei campi', () => {
  const base: DatiContatto = {
    nome: 'Maria Rossi',
    email: 'maria@esempio.it',
    azienda: '',
    messaggio: 'Un messaggio abbastanza lungo da superare il minimo.',
    consenso: true,
    honeypot: '',
    token: '',
  };

  test('accetta i dati corretti', () => {
    assert.deepEqual(validaDati(base), []);
  });

  test('rifiuta un nome troppo corto e un messaggio troppo corto', () => {
    const errori = validaDati({ ...base, nome: 'M', messaggio: 'corto' });
    assert.deepEqual(errori.sort(), ['messaggio', 'nome']);
  });

  test('rifiuta un messaggio oltre il limite di lunghezza', () => {
    const errori = validaDati({ ...base, messaggio: 'x'.repeat(4001) });
    assert.deepEqual(errori, ['messaggio']);
  });
});

describe('composizione delle email', () => {
  test('protegge i caratteri speciali nel corpo HTML', () => {
    assert.equal(
      proteggiHtml('<script>alert("x")</script>'),
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    );
  });
});
