/**
 * Interfaccia astratta per l'invio di email transazionali.
 *
 * Questo file NON deve nominare un fornitore nei tipi: descrive soltanto
 * che cosa serve al sito per spedire un messaggio. L'unico punto in cui
 * compare il fornitore è la riga di import in fondo, marcata con
 * "PUNTO DI SOSTITUZIONE": per cambiare servizio si scrive un nuovo file
 * `mailer-<fornitore>.ts` che esporta `creaMailer` e si cambia quella riga.
 *
 * `contact.ts` importa solo da qui e non conosce il fornitore.
 */

export interface MessaggioEmail {
  /** Indirizzo del destinatario. */
  to: string;
  /** Nome del destinatario, mostrato dal client di posta. */
  toName?: string;
  subject: string;
  /** Corpo in HTML. */
  html: string;
  /** Corpo in testo semplice, obbligatorio: alcuni client non mostrano l'HTML. */
  text: string;
  /** Indirizzo a cui deve rispondere chi riceve il messaggio. */
  replyTo?: string;
  replyToName?: string;
}

export type EsitoInvio =
  | { inviata: true; identificativo?: string }
  | { inviata: false; errore: string; stato?: number };

export interface Mailer {
  /**
   * Verifica che tutte le variabili d'ambiente necessarie al fornitore
   * siano presenti. Deve lanciare un errore che NOMINA la variabile
   * mancante, non un errore generico.
   */
  verificaConfigurazione(): void;
  /** Invia un singolo messaggio. Non lancia: restituisce sempre un esito tipizzato. */
  inviaEmail(messaggio: MessaggioEmail): Promise<EsitoInvio>;
}

/** Errore sollevato quando manca una variabile d'ambiente obbligatoria. */
export class ConfigurazioneMancante extends Error {
  readonly variabile: string;

  constructor(variabile: string) {
    super(
      `Variabile d'ambiente obbligatoria mancante: "${variabile}". ` +
        'Impostala nelle variabili di ambiente del sito (vedi .env.example) e ridistribuisci la funzione.'
    );
    this.name = 'ConfigurazioneMancante';
    this.variabile = variabile;
  }
}

/**
 * Legge una variabile d'ambiente obbligatoria.
 * Accetta più nomi alternativi: il primo valorizzato vince.
 * L'errore nomina il primo nome, quello preferito.
 */
export function leggiVariabileObbligatoria(...nomi: string[]): string {
  for (const nome of nomi) {
    const valore = process.env[nome];
    if (typeof valore === 'string' && valore.trim() !== '') {
      return valore.trim();
    }
  }
  throw new ConfigurazioneMancante(nomi[0] ?? 'sconosciuta');
}

export function leggiVariabileFacoltativa(nome: string, predefinito = ''): string {
  const valore = process.env[nome];
  return typeof valore === 'string' && valore.trim() !== '' ? valore.trim() : predefinito;
}

// ---------------------------------------------------------------------------
// PUNTO DI SOSTITUZIONE DEL FORNITORE — unica riga da cambiare.
// Per passare a un altro servizio: crea `mailer-<fornitore>.ts` con la stessa
// firma `creaMailer(): Mailer` e sostituisci il percorso qui sotto.
// ---------------------------------------------------------------------------
import { creaMailer as creaMailerAttivo } from './mailer-mailjet.ts';

/** Restituisce l'implementazione attiva del mailer. */
export function creaMailer(): Mailer {
  return creaMailerAttivo();
}
