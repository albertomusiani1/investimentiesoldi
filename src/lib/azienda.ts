/**
 * Dati anagrafici dell'attività.
 *
 * È l'unico punto in cui compaiono indirizzo, telefoni, email e dati fiscali:
 * footer, pagina contatti, privacy policy e JSON-LD leggono tutti da qui.
 *
 * I valori sono quelli reali forniti dal cliente. Restano da completare due
 * cose, segnate qui sotto con DA COMPLETARE: la via della sede e gli orari.
 * Finché mancano il sito non le mostra, invece di inventarle.
 */

/** Una persona di riferimento con il suo numero diretto. */
export interface Referente {
  nome: string;
  ruolo: string;
  /** Con spazi unificatori (U+00A0): il numero non deve andare a capo. */
  telefono: string;
  /** Solo cifre e prefisso, per l'attributo href="tel:". */
  telefonoLink: string;
}

export const referenti: Referente[] = [
  {
    nome: 'Davide Matteuzzi',
    ruolo: 'Progettazione meccanica',
    telefono: '+39 334 5990060',
    telefonoLink: '+393345990060',
  },
  {
    nome: 'Simone Matteuzzi',
    ruolo: 'Montaggi e revisioni',
    telefono: '+39 334 9292614',
    telefonoLink: '+393349292614',
  },
];

export const azienda = {
  nome: 'PROJECTUNE',
  nomeLegale: 'PROJECTUNE di Matteuzzi Davide',
  descrizioneBreve:
    'Progettazione meccanica, montaggi e revisioni per macchine automatiche.',
  fondazione: '2025',
  email: 'service.projectune@gmail.com',
  /** Primo riferimento telefonico: quello pubblicato nei dati strutturati. */
  telefono: referenti[0]!.telefono,
  telefonoLink: referenti[0]!.telefonoLink,
  indirizzo: {
    /** DA COMPLETARE: via e numero civico della sede di Castel Maggiore. */
    via: '',
    /** DA COMPLETARE: CAP della sede (Castel Maggiore è 40013). */
    cap: '',
    citta: 'Castel Maggiore',
    provincia: 'BO',
    regione: 'Emilia-Romagna',
    nazione: 'IT',
    nazioneEstesa: 'Italia',
  },
  /** Metri quadri dell'officina condivisa con AZ Vacuum. */
  superficieOfficina: 500,
  datiSocietari: {
    partitaIva: '04278521200',
  },
  /** Persone che compongono l'azienda. */
  dipendenti: 2,
} as const;

/** Indirizzo su una riga. Salta i pezzi non ancora forniti. */
export const indirizzoCompleto = [
  azienda.indirizzo.via,
  [azienda.indirizzo.cap, `${azienda.indirizzo.citta} (${azienda.indirizzo.provincia})`]
    .filter(Boolean)
    .join(' '),
]
  .filter(Boolean)
  .join(', ');
