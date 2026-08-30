/**
 * Isola JavaScript del modulo contatti — l'unico script che il sito invia
 * al browser.
 *
 * Intercetta l'invio, chiama la funzione serverless e mostra lo stato
 * (caricamento, successo, errore) senza ricaricare la pagina. Se il file
 * non viene eseguito il modulo continua a funzionare come POST normale.
 *
 * Nessuna stringa visibile è scritta qui: i testi arrivano dagli attributi
 * `data-*` che il componente popola da `src/i18n/it.json`.
 */
const modulo = document.getElementById('modulo-contatti');

if (modulo instanceof HTMLFormElement) {
  const dati = modulo.dataset;
  const stato = document.getElementById('stato-modulo');
  const bottone = modulo.querySelector('button[type="submit"]');
  const campi = ['nome', 'email', 'azienda', 'messaggio', 'consenso'];

  // Il widget antispam è l'unica risorsa esterna del sito e viene caricata
  // solo qui, solo se la chiave pubblica è configurata.
  const contenitoreAntispam = modulo.querySelector('.cf-turnstile');
  if (contenitoreAntispam && !document.getElementById('script-antispam')) {
    const script = document.createElement('script');
    script.id = 'script-antispam';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  const pulisciErrori = () => {
    for (const campo of campi) {
      const avviso = document.getElementById(`errore-${campo}`);
      const controllo = modulo.elements.namedItem(campo);
      if (avviso) {
        avviso.hidden = true;
        avviso.textContent = '';
      }
      if (controllo instanceof HTMLElement) controllo.removeAttribute('aria-invalid');
    }
  };

  const segnalaCampi = (elenco: string[]) => {
    for (const campo of elenco) {
      const avviso = document.getElementById(`errore-${campo}`);
      const controllo = modulo.elements.namedItem(campo);
      const testo = dati[`msg${campo.charAt(0).toUpperCase()}${campo.slice(1)}`];
      if (avviso && testo) {
        avviso.textContent = testo;
        avviso.hidden = false;
      }
      if (controllo instanceof HTMLElement) controllo.setAttribute('aria-invalid', 'true');
    }
    const primo = elenco[0];
    if (primo) {
      const controllo = modulo.elements.namedItem(primo);
      if (controllo instanceof HTMLElement) controllo.focus();
    }
  };

  const mostraStato = (tipo: string, titolo: string, testo: string, email?: string) => {
    if (!(stato instanceof HTMLElement)) return;
    stato.textContent = '';
    stato.className = `modulo__stato modulo__stato--${tipo}`;
    stato.hidden = false;

    const intestazione = document.createElement('strong');
    intestazione.textContent = titolo;
    stato.appendChild(intestazione);

    const corpo = document.createElement('span');
    corpo.textContent = ` ${testo}`;
    stato.appendChild(corpo);

    if (email) {
      const collegamento = document.createElement('a');
      collegamento.href = `mailto:${email}`;
      collegamento.textContent = email;
      stato.appendChild(document.createTextNode(' '));
      stato.appendChild(collegamento);
      stato.appendChild(document.createTextNode('.'));
    }
  };

  modulo.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    pulisciErrori();

    if (bottone instanceof HTMLButtonElement) {
      bottone.disabled = true;
      bottone.textContent = dati['msgInvio'] ?? '';
    }
    if (stato instanceof HTMLElement) stato.hidden = true;

    try {
      const risposta = await fetch(modulo.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(modulo),
      });

      const esito = await risposta.json().catch(() => ({ codice: 'server' }));

      if (risposta.ok && esito.codice === 'ok') {
        modulo.reset();
        mostraStato('successo', dati['msgSuccessoTitolo'] ?? '', dati['msgSuccessoTesto'] ?? '');
        return;
      }

      if (esito.codice === 'validazione') {
        segnalaCampi(Array.isArray(esito.campi) ? esito.campi : []);
        mostraStato('errore', dati['msgErroreTitolo'] ?? '', dati['msgValidazione'] ?? '');
        return;
      }

      if (esito.codice === 'antispam') {
        mostraStato('errore', dati['msgErroreTitolo'] ?? '', dati['msgAntispam'] ?? '');
        return;
      }

      if (esito.codice === 'troppe-richieste') {
        mostraStato('errore', dati['msgErroreTitolo'] ?? '', dati['msgTroppeRichieste'] ?? '');
        return;
      }

      mostraStato(
        'errore',
        dati['msgErroreTitolo'] ?? '',
        dati['msgErroreTesto'] ?? '',
        esito.email || dati['emailContatto']
      );
    } catch {
      mostraStato(
        'errore',
        dati['msgErroreTitolo'] ?? '',
        dati['msgErroreTesto'] ?? '',
        dati['emailContatto']
      );
    } finally {
      if (bottone instanceof HTMLButtonElement) {
        bottone.disabled = false;
        bottone.textContent = dati['msgInvia'] ?? '';
      }
    }
  });
}
