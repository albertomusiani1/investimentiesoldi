/**
 * Isola del visualizzatore di disegni.
 *
 * Due motori, nessuna libreria:
 *
 *  - **tavole 2D** — l'immagine diventa trascinabile e ingrandibile, con la
 *    rotellina che ingrandisce nel punto dove sta il puntatore e il pizzico a
 *    due dita sul telefono;
 *
 *  - **modelli 3D** — il file STL viene letto e disegnato su una tela. Le
 *    facce sono ordinate per profondità e dipinte dalla più lontana alla più
 *    vicina; sopra si tracciano gli *spigoli vivi*, cioè gli spigoli fra due
 *    facce che formano un angolo netto, che sono esattamente le linee che un
 *    disegnatore traccerebbe a mano. Si ruota trascinando, col dito, con le
 *    frecce della tastiera o inclinando il telefono.
 *
 * Tutto parte solo quando il visualizzatore entra in vista: un STL non viene
 * scaricato se il visitatore non arriva mai in fondo alla pagina.
 */

// ---------------------------------------------------------------------------
// Tipi
// ---------------------------------------------------------------------------

interface Modello {
  /** 9 numeri per triangolo: tre vertici. */
  vertici: Float32Array;
  /** 3 numeri per triangolo: la normale. */
  normali: Float32Array;
  numeroTriangoli: number;
  centro: [number, number, number];
  raggio: number;
  /** 6 numeri per spigolo: i due estremi. Ci sono TUTTI gli spigoli. */
  spigoli: Float32Array;
  /** Per ogni spigolo, gli indici dei triangoli adiacenti (−1 se assente). */
  adiacenti: Int32Array;
  /** 1 se lo spigolo è vivo, cioè se un disegnatore lo traccerebbe sempre. */
  vivi: Uint8Array;
}

type Terna = [number, number, number];

// ---------------------------------------------------------------------------
// Lettura STL — binario e ASCII
// ---------------------------------------------------------------------------

function leggiStlBinario(buffer: ArrayBuffer): { vertici: Float32Array; normali: Float32Array } | null {
  if (buffer.byteLength < 84) return null;
  const vista = new DataView(buffer);
  const numero = vista.getUint32(80, true);
  if (84 + numero * 50 !== buffer.byteLength) return null;

  const vertici = new Float32Array(numero * 9);
  const normali = new Float32Array(numero * 3);

  for (let i = 0; i < numero; i += 1) {
    const base = 84 + i * 50;
    normali[i * 3] = vista.getFloat32(base, true);
    normali[i * 3 + 1] = vista.getFloat32(base + 4, true);
    normali[i * 3 + 2] = vista.getFloat32(base + 8, true);
    for (let v = 0; v < 9; v += 1) {
      vertici[i * 9 + v] = vista.getFloat32(base + 12 + v * 4, true);
    }
  }

  return { vertici, normali };
}

function leggiStlTesto(testo: string): { vertici: Float32Array; normali: Float32Array } | null {
  const numeri = testo.match(/vertex\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)/g);
  if (!numeri || numeri.length < 3) return null;

  const punti: number[] = [];
  for (const riga of numeri) {
    const parti = riga.trim().split(/\s+/);
    punti.push(Number(parti[1]), Number(parti[2]), Number(parti[3]));
  }

  const numeroTriangoli = Math.floor(punti.length / 9);
  const vertici = new Float32Array(punti.slice(0, numeroTriangoli * 9));
  const normali = new Float32Array(numeroTriangoli * 3);
  return { vertici, normali };
}

/** Normale geometrica del triangolo, ricalcolata: quelle nel file a volte sono a zero. */
function normaleTriangolo(v: Float32Array, i: number): Terna {
  const b = i * 9;
  const ux = v[b + 3]! - v[b]!;
  const uy = v[b + 4]! - v[b + 1]!;
  const uz = v[b + 5]! - v[b + 2]!;
  const wx = v[b + 6]! - v[b]!;
  const wy = v[b + 7]! - v[b + 1]!;
  const wz = v[b + 8]! - v[b + 2]!;

  const nx = uy * wz - uz * wy;
  const ny = uz * wx - ux * wz;
  const nz = ux * wy - uy * wx;
  const lunghezza = Math.hypot(nx, ny, nz) || 1;
  return [nx / lunghezza, ny / lunghezza, nz / lunghezza];
}

/**
 * Costruisce l'elenco degli spigoli con i triangoli che vi si affacciano, e
 * marca quelli **vivi**: i bordi liberi e gli spigoli fra due facce che
 * formano un angolo netto. Sono le linee che un disegnatore traccia sempre.
 *
 * Gli altri non si buttano: servono a runtime per trovare le **sagome**, cioè
 * gli spigoli dove una faccia in vista incontra una faccia girata via. Su una
 * superficie curva la sagoma cambia a ogni rotazione — è il contorno del
 * cilindro — e senza di essa il filo di ferro sembra spezzato.
 */
const ANGOLO_VIVO = Math.cos((22 * Math.PI) / 180);

function calcolaSpigoli(
  vertici: Float32Array,
  normali: Float32Array,
  numeroTriangoli: number
): { spigoli: Float32Array; adiacenti: Int32Array; vivi: Uint8Array } {
  const chiave = (i: number) => {
    const q = (valore: number) => Math.round(valore * 1000);
    return `${q(vertici[i]!)},${q(vertici[i + 1]!)},${q(vertici[i + 2]!)}`;
  };

  const mappa = new Map<string, { a: number; b: number; t: number[] }>();

  for (let t = 0; t < numeroTriangoli; t += 1) {
    const base = t * 9;
    for (let lato = 0; lato < 3; lato += 1) {
      const i1 = base + lato * 3;
      const i2 = base + ((lato + 1) % 3) * 3;
      const k1 = chiave(i1);
      const k2 = chiave(i2);
      const k = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;

      const esistente = mappa.get(k);
      if (esistente) esistente.t.push(t);
      else mappa.set(k, { a: i1, b: i2, t: [t] });
    }
  }

  const estremi: number[] = [];
  const vicini: number[] = [];
  const marcati: number[] = [];

  for (const lato of mappa.values()) {
    let vivo = lato.t.length === 1; // bordo libero
    if (lato.t.length >= 2) {
      const [t1, t2] = lato.t as [number, number];
      const prodotto =
        normali[t1 * 3]! * normali[t2 * 3]! +
        normali[t1 * 3 + 1]! * normali[t2 * 3 + 1]! +
        normali[t1 * 3 + 2]! * normali[t2 * 3 + 2]!;
      vivo = prodotto < ANGOLO_VIVO;
    }
    marcati.push(vivo ? 1 : 0);

    estremi.push(
      vertici[lato.a]!,
      vertici[lato.a + 1]!,
      vertici[lato.a + 2]!,
      vertici[lato.b]!,
      vertici[lato.b + 1]!,
      vertici[lato.b + 2]!
    );
    vicini.push(lato.t[0] ?? -1, lato.t[1] ?? -1);
  }

  return {
    spigoli: new Float32Array(estremi),
    adiacenti: new Int32Array(vicini),
    vivi: new Uint8Array(marcati),
  };
}

function preparaModello(buffer: ArrayBuffer): Modello | null {
  const grezzo =
    leggiStlBinario(buffer) ?? leggiStlTesto(new TextDecoder().decode(buffer.slice(0, 1_000_000)));
  if (!grezzo) return null;

  const { vertici } = grezzo;
  const numeroTriangoli = Math.floor(vertici.length / 9);
  if (numeroTriangoli === 0) return null;

  // normali sempre ricalcolate: coerenti e indipendenti dal file
  const normali = new Float32Array(numeroTriangoli * 3);
  for (let t = 0; t < numeroTriangoli; t += 1) {
    const n = normaleTriangolo(vertici, t);
    normali[t * 3] = n[0];
    normali[t * 3 + 1] = n[1];
    normali[t * 3 + 2] = n[2];
  }

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < vertici.length; i += 3) {
    minX = Math.min(minX, vertici[i]!);
    maxX = Math.max(maxX, vertici[i]!);
    minY = Math.min(minY, vertici[i + 1]!);
    maxY = Math.max(maxY, vertici[i + 1]!);
    minZ = Math.min(minZ, vertici[i + 2]!);
    maxZ = Math.max(maxZ, vertici[i + 2]!);
  }

  const centro: Terna = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];
  const raggio = Math.max(maxX - minX, maxY - minY, maxZ - minZ) / 2 || 1;

  const { spigoli, adiacenti, vivi } = calcolaSpigoli(vertici, normali, numeroTriangoli);

  return { vertici, normali, numeroTriangoli, centro, raggio, spigoli, adiacenti, vivi };
}

// ---------------------------------------------------------------------------
// Motore 3D
// ---------------------------------------------------------------------------

const IMBARDATA_INIZIALE = -0.62;
const BECCHEGGIO_INIZIALE = 1.05;
const LUCE: Terna = [-0.35, 0.5, 0.79];

/** Stessa rotazione usata per generare le anteprime: la vista iniziale coincide. */
function ruota(x: number, y: number, z: number, imbardata: number, beccheggio: number): Terna {
  const cy = Math.cos(imbardata);
  const sy = Math.sin(imbardata);
  const x1 = x * cy - y * sy;
  const y1 = x * sy + y * cy;

  const cp = Math.cos(beccheggio);
  const sp = Math.sin(beccheggio);
  return [x1, z * sp + y1 * cp, z * cp - y1 * sp];
}

interface Motore {
  disegna: () => void;
  richiediDisegno: () => void;
  imposta: (modifica: Partial<{ imbardata: number; beccheggio: number; zoom: number }>) => void
  stato: {
    imbardata: number;
    beccheggio: number;
    zoom: number;
    filoDiFerro: boolean;
    automatica: boolean;
  };
  reimposta: () => void;
}

function creaMotore3D(tela: HTMLCanvasElement, modello: Modello, alCambioZoom: (zoom: number) => void): Motore {
  const contestoGrezzo = tela.getContext('2d');
  if (!contestoGrezzo) throw new Error('tela non disponibile');
  const contesto: CanvasRenderingContext2D = contestoGrezzo;

  const stato = {
    imbardata: IMBARDATA_INIZIALE,
    beccheggio: BECCHEGGIO_INIZIALE,
    zoom: 1,
    filoDiFerro: false,
    automatica: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };

  let larghezza = 0;
  let altezza = 0;
  let rapporto = 1;
  let daDisegnare = true;

  const ridimensiona = () => {
    const misure = tela.getBoundingClientRect();
    rapporto = Math.min(window.devicePixelRatio || 1, 2);
    larghezza = Math.max(1, Math.round(misure.width));
    altezza = Math.max(1, Math.round(misure.height));
    tela.width = Math.round(larghezza * rapporto);
    tela.height = Math.round(altezza * rapporto);
    daDisegnare = true;
  };

  // riserve riusate a ogni fotogramma: niente allocazioni nel ciclo di disegno
  const numeroSpigoli = modello.spigoli.length / 6;
  const proiettatiX = new Float32Array(modello.numeroTriangoli * 3);
  const proiettatiY = new Float32Array(modello.numeroTriangoli * 3);
  const luminosita = new Float32Array(modello.numeroTriangoli);
  const davanti = new Uint8Array(modello.numeroTriangoli);

  const spigoloX1 = new Float32Array(numeroSpigoli);
  const spigoloY1 = new Float32Array(numeroSpigoli);
  const spigoloX2 = new Float32Array(numeroSpigoli);
  const spigoloY2 = new Float32Array(numeroSpigoli);
  const spigoloVisibile = new Uint8Array(numeroSpigoli);

  /**
   * Facce e spigoli finiscono in un'unica lista ordinata per profondità:
   * dipingendoli mescolati, un pezzo di geometria che sta davanti copre gli
   * spigoli che stanno dietro. Tenendoli separati — prima tutte le facce, poi
   * tutti gli spigoli — le linee del lato nascosto si vedrebbero attraverso
   * il pieno.
   */
  const profondita = new Float32Array(modello.numeroTriangoli + numeroSpigoli);
  const ordine = new Int32Array(modello.numeroTriangoli + numeroSpigoli);
  /** Indici delle caselle riempite: è questo che si ordina, non i contenuti. */
  const caselle = new Int32Array(modello.numeroTriangoli + numeroSpigoli);

  function disegna(): void {
    if (larghezza === 0) ridimensiona();

    const { vertici, normali, numeroTriangoli, centro, raggio } = modello;
    const scala = ((Math.min(larghezza, altezza) * 0.42) / raggio) * stato.zoom;
    const cx = larghezza / 2;
    const cy = altezza / 2;
    // Gli spigoli vengono avvicinati di un'inezia, altrimenti si contendono
    // la profondità con le facce a cui appartengono.
    const sporgenza = raggio * 0.006;

    contesto.setTransform(rapporto, 0, 0, rapporto, 0, 0);
    contesto.clearRect(0, 0, larghezza, altezza);

    let daDipingere = 0;

    // --- facce ---------------------------------------------------------
    for (let t = 0; t < numeroTriangoli; t += 1) {
      const n = ruota(
        normali[t * 3]!,
        normali[t * 3 + 1]!,
        normali[t * 3 + 2]!,
        stato.imbardata,
        stato.beccheggio
      );
      const frontale = n[2] > 0;
      davanti[t] = frontale ? 1 : 0;

      let sommaZ = 0;
      for (let v = 0; v < 3; v += 1) {
        const b = t * 9 + v * 3;
        const p = ruota(
          vertici[b]! - centro[0],
          vertici[b + 1]! - centro[1],
          vertici[b + 2]! - centro[2],
          stato.imbardata,
          stato.beccheggio
        );
        proiettatiX[t * 3 + v] = cx + p[0] * scala;
        proiettatiY[t * 3 + v] = cy - p[1] * scala;
        sommaZ += p[2];
      }
      luminosita[t] = Math.max(0, n[0] * LUCE[0] + n[1] * LUCE[1] + n[2] * LUCE[2]);

      if (frontale && !stato.filoDiFerro) {
        profondita[daDipingere] = sommaZ / 3;
        ordine[daDipingere] = t;
        daDipingere += 1;
      }
    }

    // --- spigoli -------------------------------------------------------
    // Si tracciano quelli **vivi**, che un disegnatore mette sempre, e le
    // **sagome**, dove una faccia in vista incontra una faccia girata via:
    // sono il contorno delle superfici curve e cambiano a ogni rotazione.
    for (let e = 0; e < numeroSpigoli; e += 1) {
      const t1 = modello.adiacenti[e * 2]!;
      const t2 = modello.adiacenti[e * 2 + 1]!;
      const primaInVista = t1 >= 0 && davanti[t1] === 1;
      const secondaInVista = t2 >= 0 && davanti[t2] === 1;
      const sagoma = t1 >= 0 && t2 >= 0 && primaInVista !== secondaInVista;
      const vivo = modello.vivi[e] === 1;

      const daTracciare = stato.filoDiFerro
        ? vivo || sagoma
        : sagoma || (vivo && (primaInVista || secondaInVista));

      spigoloVisibile[e] = daTracciare ? 1 : 0;
      if (!daTracciare) continue;

      const b = e * 6;
      const p1 = ruota(
        modello.spigoli[b]! - centro[0],
        modello.spigoli[b + 1]! - centro[1],
        modello.spigoli[b + 2]! - centro[2],
        stato.imbardata,
        stato.beccheggio
      );
      const p2 = ruota(
        modello.spigoli[b + 3]! - centro[0],
        modello.spigoli[b + 4]! - centro[1],
        modello.spigoli[b + 5]! - centro[2],
        stato.imbardata,
        stato.beccheggio
      );

      spigoloX1[e] = cx + p1[0] * scala;
      spigoloY1[e] = cy - p1[1] * scala;
      spigoloX2[e] = cx + p2[0] * scala;
      spigoloY2[e] = cy - p2[1] * scala;

      profondita[daDipingere] = (p1[2] + p2[2]) / 2 + sporgenza;
      ordine[daDipingere] = numeroTriangoli + e;
      daDipingere += 1;
    }

    // --- dal più lontano al più vicino ---------------------------------
    for (let i = 0; i < daDipingere; i += 1) caselle[i] = i;
    const lista = caselle.subarray(0, daDipingere);
    lista.sort((a, b) => profondita[a]! - profondita[b]!);

    contesto.lineJoin = 'round';
    contesto.lineCap = 'round';

    for (let i = 0; i < lista.length; i += 1) {
      const casella = lista[i]!;
      const voce = ordine[casella]!;

      if (voce < numeroTriangoli) {
        const t = voce;
        const tono = Math.round(88 + luminosita[t]! * 132);
        const colore = `rgb(${Math.round(tono * 0.9)},${Math.round(tono * 0.96)},${tono})`;
        contesto.fillStyle = colore;
        // Il contorno dello stesso colore chiude le cuciture: due riempimenti
        // adiacenti lasciano in mezzo una riga chiara di antialiasing, che a
        // occhio sembra una rigatura sulla superficie.
        contesto.strokeStyle = colore;
        contesto.lineWidth = 1;
        contesto.beginPath();
        contesto.moveTo(proiettatiX[t * 3]!, proiettatiY[t * 3]!);
        contesto.lineTo(proiettatiX[t * 3 + 1]!, proiettatiY[t * 3 + 1]!);
        contesto.lineTo(proiettatiX[t * 3 + 2]!, proiettatiY[t * 3 + 2]!);
        contesto.closePath();
        contesto.fill();
        contesto.stroke();
        continue;
      }

      const e = voce - numeroTriangoli;
      contesto.lineWidth = stato.filoDiFerro ? 1.1 : 1.3;
      if (stato.filoDiFerro) {
        // profondità normalizzata sul raggio del pezzo: le linee lontane
        // sbiadiscono, come in un wireframe da CAD
        // Il fondo del viewport è scuro: in filo di ferro le linee sono
        // chiare, e quelle lontane sbiadiscono invece di scurirsi.
        const vicinanza = Math.max(0, Math.min(1, (profondita[casella]! / raggio + 1) / 2));
        contesto.strokeStyle = `rgba(214,226,232,${(0.14 + vicinanza * 0.76).toFixed(2)})`;
      } else {
        contesto.strokeStyle = 'rgba(24,30,32,0.92)';
      }
      contesto.beginPath();
      contesto.moveTo(spigoloX1[e]!, spigoloY1[e]!);
      contesto.lineTo(spigoloX2[e]!, spigoloY2[e]!);
      contesto.stroke();
    }
  }

  let animazione = 0;
  const ciclo = () => {
    animazione = 0;
    if (stato.automatica) {
      stato.imbardata += 0.0045;
      daDisegnare = true;
    }
    if (daDisegnare) {
      daDisegnare = false;
      disegna();
    }
    if (stato.automatica) richiediDisegno();
  };

  function richiediDisegno(): void {
    if (animazione !== 0) return;
    animazione = window.requestAnimationFrame(ciclo);
  }

  const alRidimensionamento = () => {
    ridimensiona();
    richiediDisegno();
  };

  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(alRidimensionamento).observe(tela);
  } else {
    window.addEventListener('resize', alRidimensionamento);
  }

  const imposta: Motore['imposta'] = (modifica) => {
    if (modifica.imbardata !== undefined) stato.imbardata = modifica.imbardata;
    if (modifica.beccheggio !== undefined) {
      stato.beccheggio = Math.max(0.05, Math.min(Math.PI - 0.05, modifica.beccheggio));
    }
    if (modifica.zoom !== undefined) {
      stato.zoom = Math.max(0.4, Math.min(6, modifica.zoom));
      alCambioZoom(stato.zoom);
    }
    daDisegnare = true;
    richiediDisegno();
  };

  const reimposta = () => {
    stato.imbardata = IMBARDATA_INIZIALE;
    stato.beccheggio = BECCHEGGIO_INIZIALE;
    imposta({ zoom: 1 });
  };

  ridimensiona();
  richiediDisegno();

  return { disegna, richiediDisegno, imposta, stato, reimposta };
}

// ---------------------------------------------------------------------------
// Comandi comuni: trascinamento, rotellina, pizzico, tastiera
// ---------------------------------------------------------------------------

interface Trascinamento {
  su: (dx: number, dy: number) => void;
  pizzico: (fattore: number, x: number, y: number) => void;
}

function collegaGesti(bersaglio: HTMLElement, azioni: Trascinamento, allInterazione: () => void): void {
  const puntatori = new Map<number, { x: number; y: number }>();
  let distanzaPrecedente = 0;

  bersaglio.addEventListener('pointerdown', (evento) => {
    bersaglio.setPointerCapture(evento.pointerId);
    puntatori.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    bersaglio.classList.add('scena--presa');
    allInterazione();
  });

  bersaglio.addEventListener('pointermove', (evento) => {
    const precedente = puntatori.get(evento.pointerId);
    if (!precedente) return;

    if (puntatori.size === 1) {
      azioni.su(evento.clientX - precedente.x, evento.clientY - precedente.y);
    }
    puntatori.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });

    if (puntatori.size === 2) {
      const [a, b] = [...puntatori.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const distanza = Math.hypot(a.x - b.x, a.y - b.y);
      if (distanzaPrecedente > 0 && distanza > 0) {
        const misure = bersaglio.getBoundingClientRect();
        azioni.pizzico(
          distanza / distanzaPrecedente,
          (a.x + b.x) / 2 - misure.left,
          (a.y + b.y) / 2 - misure.top
        );
      }
      distanzaPrecedente = distanza;
    }
  });

  const rilascia = (evento: PointerEvent) => {
    puntatori.delete(evento.pointerId);
    if (puntatori.size < 2) distanzaPrecedente = 0;
    if (puntatori.size === 0) bersaglio.classList.remove('scena--presa');
  };

  bersaglio.addEventListener('pointerup', rilascia);
  bersaglio.addEventListener('pointercancel', rilascia);

  bersaglio.addEventListener(
    'wheel',
    (evento) => {
      evento.preventDefault();
      allInterazione();
      const misure = bersaglio.getBoundingClientRect();
      const fattore = Math.exp(-evento.deltaY * 0.0016);
      azioni.pizzico(fattore, evento.clientX - misure.left, evento.clientY - misure.top);
    },
    { passive: false }
  );
}

// ---------------------------------------------------------------------------
// Giroscopio
// ---------------------------------------------------------------------------

interface EventoOrientamentoIos {
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
}

function collegaGiroscopio(
  bottone: HTMLButtonElement,
  motore: Motore,
  messaggioNegato: string,
  mostraStato: (testo: string | null) => void,
  etichette: { spento: string; acceso: string }
): void {
  if (typeof window.DeviceOrientationEvent === 'undefined') return;
  bottone.hidden = false;

  let attivo = false;
  let base: { beta: number; gamma: number } | null = null;
  const partenza = { imbardata: motore.stato.imbardata, beccheggio: motore.stato.beccheggio };

  const alMovimento = (evento: DeviceOrientationEvent) => {
    if (evento.beta === null || evento.gamma === null) return;
    if (!base) {
      base = { beta: evento.beta, gamma: evento.gamma };
      partenza.imbardata = motore.stato.imbardata;
      partenza.beccheggio = motore.stato.beccheggio;
      return;
    }
    const gradi = Math.PI / 180;
    motore.imposta({
      imbardata: partenza.imbardata + (evento.gamma - base.gamma) * gradi * 1.6,
      beccheggio: partenza.beccheggio - (evento.beta - base.beta) * gradi * 1.6,
    });
  };

  const spegni = () => {
    attivo = false;
    base = null;
    window.removeEventListener('deviceorientation', alMovimento);
    bottone.setAttribute('aria-pressed', 'false');
    bottone.textContent = etichette.spento;
    mostraStato(null);
  };

  const accendi = () => {
    attivo = true;
    base = null;
    motore.stato.automatica = false;
    window.addEventListener('deviceorientation', alMovimento);
    bottone.setAttribute('aria-pressed', 'true');
    bottone.textContent = etichette.acceso;
  };

  bottone.addEventListener('click', async () => {
    if (attivo) {
      spegni();
      return;
    }

    const costruttore = window.DeviceOrientationEvent as unknown as EventoOrientamentoIos;
    if (typeof costruttore.requestPermission === 'function') {
      try {
        const esito = await costruttore.requestPermission();
        if (esito !== 'granted') {
          mostraStato(messaggioNegato);
          return;
        }
      } catch {
        mostraStato(messaggioNegato);
        return;
      }
    }

    accendi();
  });
}

// ---------------------------------------------------------------------------
// Avvio di un pannello
// ---------------------------------------------------------------------------

function avviaPannello2D(pannello: HTMLElement): void {
  const scena = pannello.querySelector<HTMLElement>('[data-scena]');
  const immagine = pannello.querySelector<HTMLImageElement>('[data-statica]');
  const comandi = pannello.querySelector<HTMLElement>('[data-comandi]');
  const istruzioni = pannello.querySelector<HTMLElement>('[data-istruzioni]');
  const letturaZoom = pannello.querySelector<HTMLElement>('[data-zoom]');
  if (!scena || !immagine) return;

  const vista = { x: 0, y: 0, zoom: 1 };

  const applica = () => {
    immagine.style.transform = `translate(${vista.x}px, ${vista.y}px) scale(${vista.zoom})`;
    if (letturaZoom) letturaZoom.textContent = `${Math.round(vista.zoom * 100)}%`;
  };

  const adatta = () => {
    vista.x = 0;
    vista.y = 0;
    vista.zoom = 1;
    applica();
  };

  const zoomVerso = (fattore: number, x: number, y: number) => {
    const nuovo = Math.max(0.5, Math.min(8, vista.zoom * fattore));
    const effettivo = nuovo / vista.zoom;
    vista.x = x - (x - vista.x) * effettivo;
    vista.y = y - (y - vista.y) * effettivo;
    vista.zoom = nuovo;
    applica();
  };

  scena.classList.add('scena--pronta');
  if (comandi) comandi.hidden = false;
  if (istruzioni) istruzioni.hidden = false;
  applica();

  collegaGesti(
    scena,
    {
      su: (dx, dy) => {
        vista.x += dx;
        vista.y += dy;
        applica();
      },
      pizzico: zoomVerso,
    },
    () => undefined
  );

  comandi?.addEventListener('click', (evento) => {
    const bottone = (evento.target as HTMLElement).closest<HTMLButtonElement>('[data-azione]');
    if (!bottone) return;
    const centro = scena.getBoundingClientRect();
    if (bottone.dataset['azione'] === 'ingrandisci') zoomVerso(1.25, centro.width / 2, centro.height / 2);
    if (bottone.dataset['azione'] === 'riduci') zoomVerso(0.8, centro.width / 2, centro.height / 2);
    if (bottone.dataset['azione'] === 'adatta') adatta();
  });

  immagine.addEventListener('keydown', (evento) => {
    const passo = 40;
    const mappa: Record<string, () => void> = {
      ArrowLeft: () => (vista.x += passo),
      ArrowRight: () => (vista.x -= passo),
      ArrowUp: () => (vista.y += passo),
      ArrowDown: () => (vista.y -= passo),
    };
    const misure = scena.getBoundingClientRect();
    if (mappa[evento.key]) {
      evento.preventDefault();
      mappa[evento.key]!();
      applica();
    } else if (evento.key === '+' || evento.key === '=') {
      evento.preventDefault();
      zoomVerso(1.25, misure.width / 2, misure.height / 2);
    } else if (evento.key === '-') {
      evento.preventDefault();
      zoomVerso(0.8, misure.width / 2, misure.height / 2);
    }
  });
}

async function avviaPannello3D(pannello: HTMLElement, testi: Record<string, string>): Promise<void> {
  const scena = pannello.querySelector<HTMLElement>('[data-scena]');
  const tela = pannello.querySelector<HTMLCanvasElement>('[data-tela]');
  const stato = pannello.querySelector<HTMLElement>('[data-stato]');
  const comandi = pannello.querySelector<HTMLElement>('[data-comandi]');
  const istruzioni = pannello.querySelector<HTMLElement>('[data-istruzioni]');
  const dati = pannello.querySelector<HTMLElement>('[data-dati]');
  const letturaZoom = pannello.querySelector<HTMLElement>('[data-zoom]');
  const file = pannello.dataset['file'];
  if (!scena || !tela || !file) return;

  const mostraStato = (messaggio: string | null) => {
    if (!stato) return;
    stato.textContent = messaggio ?? '';
    stato.hidden = messaggio === null;
  };

  mostraStato(testi['caricamento'] ?? '');

  let modello: Modello | null = null;
  try {
    const risposta = await fetch(file);
    if (!risposta.ok) throw new Error(String(risposta.status));
    modello = preparaModello(await risposta.arrayBuffer());
  } catch {
    modello = null;
  }

  if (!modello) {
    mostraStato(testi['errore'] ?? '');
    return;
  }

  mostraStato(null);
  scena.classList.add('scena--pronta');
  if (comandi) comandi.hidden = false;
  if (istruzioni) istruzioni.hidden = false;
  if (dati) dati.textContent = `${modello.numeroTriangoli.toLocaleString('it-IT')} ${testi['triangoli'] ?? ''}`;

  const motore = creaMotore3D(tela, modello, (zoom) => {
    if (letturaZoom) letturaZoom.textContent = `${Math.round(zoom * 100)}%`;
  });

  const fermaAutomatica = () => {
    if (!motore.stato.automatica) return;
    motore.stato.automatica = false;
    const bottone = comandi?.querySelector<HTMLButtonElement>('[data-azione="rotazione"]');
    bottone?.setAttribute('aria-pressed', 'false');
  };

  collegaGesti(
    scena,
    {
      su: (dx, dy) =>
        motore.imposta({
          imbardata: motore.stato.imbardata + dx * 0.008,
          beccheggio: motore.stato.beccheggio - dy * 0.008,
        }),
      pizzico: (fattore) => motore.imposta({ zoom: motore.stato.zoom * fattore }),
    },
    fermaAutomatica
  );

  tela.addEventListener('keydown', (evento) => {
    const passo = 0.12;
    const azioni: Record<string, () => void> = {
      ArrowLeft: () => motore.imposta({ imbardata: motore.stato.imbardata - passo }),
      ArrowRight: () => motore.imposta({ imbardata: motore.stato.imbardata + passo }),
      ArrowUp: () => motore.imposta({ beccheggio: motore.stato.beccheggio + passo }),
      ArrowDown: () => motore.imposta({ beccheggio: motore.stato.beccheggio - passo }),
      '+': () => motore.imposta({ zoom: motore.stato.zoom * 1.2 }),
      '=': () => motore.imposta({ zoom: motore.stato.zoom * 1.2 }),
      '-': () => motore.imposta({ zoom: motore.stato.zoom / 1.2 }),
    };
    if (!azioni[evento.key]) return;
    evento.preventDefault();
    fermaAutomatica();
    azioni[evento.key]!();
  });

  comandi?.addEventListener('click', (evento) => {
    const bottone = (evento.target as HTMLElement).closest<HTMLButtonElement>('[data-azione]');
    if (!bottone) return;
    const azione = bottone.dataset['azione'];

    if (azione === 'ingrandisci') motore.imposta({ zoom: motore.stato.zoom * 1.25 });
    if (azione === 'riduci') motore.imposta({ zoom: motore.stato.zoom / 1.25 });
    if (azione === 'adatta') motore.reimposta();

    if (azione === 'resa') {
      motore.stato.filoDiFerro = !motore.stato.filoDiFerro;
      bottone.setAttribute('aria-pressed', String(motore.stato.filoDiFerro));
      bottone.textContent = motore.stato.filoDiFerro ? testi['ombreggiato']! : testi['filoDiFerro']!;
      motore.imposta({});
    }

    if (azione === 'rotazione') {
      motore.stato.automatica = !motore.stato.automatica;
      bottone.setAttribute('aria-pressed', String(motore.stato.automatica));
      bottone.textContent = motore.stato.automatica
        ? testi['fermaRotazione']!
        : testi['rotazioneAutomatica']!;
      motore.richiediDisegno();
    }
  });

  const bottoneGiroscopio = comandi?.querySelector<HTMLButtonElement>('[data-azione="giroscopio"]');
  if (bottoneGiroscopio) {
    collegaGiroscopio(bottoneGiroscopio, motore, testi['giroscopioNegato'] ?? '', mostraStato, {
      spento: testi['giroscopio'] ?? '',
      acceso: testi['giroscopioAttivo'] ?? '',
    });
  }
}

// ---------------------------------------------------------------------------
// Avvio: solo quando il visualizzatore entra in vista
// ---------------------------------------------------------------------------

const visualizzatore = document.querySelector<HTMLElement>('[data-visualizzatore]');

if (visualizzatore) {
  // I testi arrivano dal DOM, così non c'è nessuna stringa scritta qui dentro:
  // restano tutte in src/i18n/it.json.
  const testi: Record<string, string> = {
    caricamento: '',
    errore: '',
    triangoli: '',
    ombreggiato: '',
    filoDiFerro: '',
    rotazioneAutomatica: '',
    fermaRotazione: '',
    giroscopio: '',
    giroscopioAttivo: '',
    giroscopioNegato: '',
  };

  const dizionario = document.querySelector<HTMLElement>('[data-testi-disegni]');
  if (dizionario) {
    for (const chiave of Object.keys(testi)) {
      testi[chiave] = dizionario.dataset[chiave] ?? '';
    }
  }

  const pannelli = [...visualizzatore.querySelectorAll<HTMLElement>('[data-pannello]')];
  const avviati = new Set<HTMLElement>();

  const avvia = (pannello: HTMLElement) => {
    if (avviati.has(pannello)) return;
    avviati.add(pannello);
    if (pannello.dataset['tipo'] === 'modello3d') void avviaPannello3D(pannello, testi);
    else avviaPannello2D(pannello);
  };

  const avviaTutti = () => pannelli.forEach(avvia);

  if (typeof IntersectionObserver === 'function') {
    const osservatore = new IntersectionObserver(
      (voci) => {
        if (voci.some((voce) => voce.isIntersecting)) {
          avviaTutti();
          osservatore.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    osservatore.observe(visualizzatore);
  } else {
    avviaTutti();
  }
}
