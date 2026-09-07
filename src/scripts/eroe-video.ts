/**
 * Isola del video del hero.
 *
 * Fa tre cose e nient'altro:
 *  1. non parte se il sistema chiede meno animazioni;
 *  2. avvia il video quando il hero è in vista e lo mette in pausa quando
 *     non lo è più, così scorrendo la pagina non resta a girare a vuoto;
 *  3. mostra il video solo quando ha davvero cominciato a scorrere, per non
 *     far comparire un rettangolo nero al posto del fermo immagine.
 *
 * Misura anche l'altezza vera dell'intestazione e la scrive nella variabile
 * CSS che il hero usa per occupare il resto della finestra: quel valore non
 * si può conoscere in CSS, perché dipende da quante righe occupa il menu.
 * Senza JavaScript resta la ricaduta dichiarata in global.css.
 *
 * Se qualcosa non va — autoplay negato, formato non supportato, file
 * mancante — resta visibile il poster e la pagina funziona come prima.
 */
const CLASSE_ATTIVO = 'eroe__video--attivo';

function avvia(sezione: HTMLElement): void {
  const video = sezione.querySelector<HTMLVideoElement>('[data-eroe-video]');
  if (!video) return;

  const menoAnimazioni = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (menoAnimazioni.matches) return;

  // La dissolvenza scatta al primo fotogramma davvero disegnato.
  video.addEventListener('playing', () => video.classList.add(CLASSE_ATTIVO), { once: true });

  const riproduci = () => {
    // `play()` restituisce una promessa che il browser rifiuta quando
    // l'autoplay non è consentito: in quel caso non c'è niente da fare
    // se non lasciare il poster.
    void video.play().catch(() => undefined);
  };

  const inPausa = () => {
    if (!video.paused) video.pause();
  };

  if (typeof IntersectionObserver !== 'function') {
    riproduci();
    return;
  }

  const osservatore = new IntersectionObserver(
    (voci) => {
      for (const voce of voci) {
        if (voce.isIntersecting) riproduci();
        else inPausa();
      }
    },
    { threshold: 0.15 }
  );

  osservatore.observe(sezione);

  // Se l'utente cambia idea sulle animazioni mentre sta guardando la pagina.
  menoAnimazioni.addEventListener('change', (evento) => {
    if (evento.matches) {
      inPausa();
      video.classList.remove(CLASSE_ATTIVO);
    } else {
      riproduci();
    }
  });

  // Un video in pausa mentre la scheda è nascosta non serve a nessuno.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) inPausa();
  });
}

/**
 * Allinea `--altezza-intestazione` all'altezza reale dell'intestazione.
 * Scrivere sulla CSSOM non è interessato dalla Content-Security-Policy:
 * `style-src` riguarda i fogli e gli attributi `style` nel markup.
 */
function misuraIntestazione(): void {
  const intestazione = document.querySelector<HTMLElement>('.intestazione');
  if (!intestazione) return;

  const applica = () => {
    const altezza = intestazione.getBoundingClientRect().height;
    if (altezza > 0) {
      document.documentElement.style.setProperty('--altezza-intestazione', `${Math.round(altezza)}px`);
    }
  };

  applica();

  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(applica).observe(intestazione);
  } else {
    window.addEventListener('resize', applica);
  }
}

const sezione = document.querySelector<HTMLElement>('[data-eroe]');
if (sezione) {
  misuraIntestazione();
  avvia(sezione);
}
