/**
 * Dati anagrafici dell'attività.
 *
 * SOSTITUIRE PRIMA DI ANDARE ONLINE: ogni valore di questo file è un
 * segnaposto realistico ma inventato. È l'unico punto in cui compaiono
 * indirizzo, telefono, email e dati societari: footer, pagina contatti,
 * privacy policy e JSON-LD leggono tutti da qui.
 */
export const azienda = {
  nome: 'Brambilla Future',
  nomeLegale: 'Brambilla Future S.r.l.',
  descrizioneBreve:
    "Progettazione, produzione e validazione di componenti per l'industria automotive.",
  fondazione: '1978',
  email: 'info@brambillafuture.it',
  emailPec: 'brambillafuture@pec.it',
  // Spazi unificatori (U+00A0): il numero non deve andare a capo.
  telefono: '+39 0362 550 118',
  telefonoLink: '+390362550118',
  indirizzo: {
    via: "Via dell'Industria 24",
    cap: '20831',
    citta: 'Seregno',
    provincia: 'MB',
    regione: 'Lombardia',
    nazione: 'IT',
    nazioneEstesa: 'Italia',
  },
  coordinate: {
    latitudine: 45.6501,
    longitudine: 9.2038,
  },
  orari: [
    { giorni: 'Lunedì – giovedì', orario: '08:00 – 12:30 / 13:30 – 17:30' },
    { giorni: 'Venerdì', orario: '08:00 – 14:00' },
    { giorni: 'Sabato e domenica', orario: 'Chiuso' },
  ],
  datiSocietari: {
    partitaIva: 'IT01234567890',
    rea: 'MB-1234567',
    capitaleSociale: '250.000,00 € i.v.',
  },
  /** Numero di dipendenti, usato nella pagina Chi siamo e nel JSON-LD. */
  dipendenti: 60,
} as const;

export const indirizzoCompleto = `${azienda.indirizzo.via}, ${azienda.indirizzo.cap} ${azienda.indirizzo.citta} (${azienda.indirizzo.provincia})`;
