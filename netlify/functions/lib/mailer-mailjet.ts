import {
  leggiVariabileObbligatoria,
  type EsitoInvio,
  type Mailer,
  type MessaggioEmail,
} from './mailer.ts';

/**
 * Implementazione dell'interfaccia Mailer sull'API REST v3.1 di Mailjet.
 *
 * Nessun SDK: si usa `fetch` con autenticazione HTTP Basic costruita da
 * chiave pubblica e chiave segreta. Le credenziali arrivano solo da
 * variabili d'ambiente e non compaiono mai nei log.
 *
 * Le variabili hanno un nome generico (MAILER_*) con ricaduta sui nomi
 * storici del fornitore, così un cambio di servizio non obbliga a
 * rinominare le variabili su tutti gli ambienti.
 */
const ENDPOINT = 'https://api.mailjet.com/v3.1/send';
const TIMEOUT_MS = 10_000;

interface RispostaMessaggio {
  Status?: string;
  Errors?: { ErrorMessage?: string }[];
  To?: { MessageUUID?: string }[];
}

interface RispostaInvio {
  Messages?: RispostaMessaggio[];
}

function credenziali(): { chiave: string; segreto: string } {
  return {
    chiave: leggiVariabileObbligatoria('MAILER_API_KEY', 'MAILJET_API_KEY'),
    segreto: leggiVariabileObbligatoria('MAILER_API_SECRET', 'MAILJET_SECRET_KEY'),
  };
}

function mittente(): { email: string; nome: string } {
  return {
    email: leggiVariabileObbligatoria('CONTACT_FROM_EMAIL'),
    nome: leggiVariabileObbligatoria('CONTACT_FROM_NAME'),
  };
}

export function creaMailer(): Mailer {
  return {
    verificaConfigurazione(): void {
      credenziali();
      mittente();
    },

    async inviaEmail(messaggio: MessaggioEmail): Promise<EsitoInvio> {
      const { chiave, segreto } = credenziali();
      const da = mittente();

      const corpo = {
        Messages: [
          {
            From: { Email: da.email, Name: da.nome },
            To: [{ Email: messaggio.to, Name: messaggio.toName ?? messaggio.to }],
            Subject: messaggio.subject,
            TextPart: messaggio.text,
            HTMLPart: messaggio.html,
            ...(messaggio.replyTo
              ? {
                  ReplyTo: {
                    Email: messaggio.replyTo,
                    Name: messaggio.replyToName ?? messaggio.replyTo,
                  },
                }
              : {}),
          },
        ],
      };

      const autorizzazione = Buffer.from(`${chiave}:${segreto}`).toString('base64');
      const interruttore = AbortSignal.timeout(TIMEOUT_MS);

      try {
        const risposta = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${autorizzazione}`,
          },
          body: JSON.stringify(corpo),
          signal: interruttore,
        });

        if (!risposta.ok) {
          const testo = await risposta.text().catch(() => '');
          return {
            inviata: false,
            stato: risposta.status,
            errore: `Risposta ${risposta.status} dal servizio di posta: ${testo.slice(0, 300)}`,
          };
        }

        const dati = (await risposta.json()) as RispostaInvio;
        const primo = dati.Messages?.[0];

        if (primo?.Status !== 'success') {
          const dettaglio = primo?.Errors?.map((e) => e.ErrorMessage).join('; ') ?? 'motivo non indicato';
          return { inviata: false, stato: risposta.status, errore: `Invio rifiutato: ${dettaglio}` };
        }

        return { inviata: true, identificativo: primo.To?.[0]?.MessageUUID };
      } catch (errore) {
        const messaggioErrore = errore instanceof Error ? errore.message : String(errore);
        return { inviata: false, errore: `Chiamata al servizio di posta non riuscita: ${messaggioErrore}` };
      }
    },
  };
}
