# mcp-ads — server MCP per Meta Ads

Server MCP che permette a Claude di leggere e modificare gli account pubblicitari
Meta. È il "centralinista": tiene lui il token, Claude non lo vede mai — gli chiede
un'informazione o una modifica, e lui parla con Meta.

Stato: **Meta Ads completo**. Google Ads e GA4 sono previsti come moduli separati
in `src/google-ads/` e `src/ga4/`, ancora da scrivere.

## Come funziona

```
Claude  ──MCP──▶  questo server  ──HTTPS──▶  graph.facebook.com
                  (custodisce il token,
                   applica i guardrail)
```

Un unico nucleo di logica, tre "gusci" a scelta:

| Entrypoint | Quando usarlo |
|---|---|
| `src/stdio.ts` | **In locale.** Claude Code avvia il processo e ci parla su stdin/stdout. Nessuna porta aperta, nessun URL pubblico. |
| `src/http.ts` | Server online su Node (Fly.io, Railway, Render, VPS). Protetto da bearer token. |
| `src/worker.ts` | Server online su Cloudflare Workers. |

Passare da locale a online non richiede di riscrivere nulla: cambia solo quale
entrypoint avvii.

## 1. Ottenere il token Meta

Serve un **System User token**, non un token personale: non scade al cambio password
e non è legato al tuo profilo.

1. Vai su [business.facebook.com](https://business.facebook.com) → **Impostazioni azienda**.
2. **Utenti → Utenti di sistema → Aggiungi**. Dai un nome (es. `claude-ads`) e ruolo *Amministratore*.
3. Sull'utente appena creato, **Aggiungi risorse** → *Account pubblicitari* → seleziona
   i tuoi account → attiva **Gestisci campagne**.
4. **Genera nuovo token**:
   - App: seleziona una tua app (se non ne hai, creane una su
     [developers.facebook.com](https://developers.facebook.com) → tipo *Azienda*);
   - Permessi: `ads_read` (lettura) e `ads_management` (modifiche);
   - Scadenza: *Mai*.
5. **Copia il token adesso**: non sarà più visibile.

Non serve nessuna App Review finché operi solo sui tuoi account pubblicitari.

## 2. Installazione locale

```bash
cd tools/mcp-ads
npm install
npm run build

cp .env.example .env
# apri .env e incolla il token in META_ACCESS_TOKEN
```

Compila anche i guardrail nel `.env` — vedi la sezione dedicata sotto. Il file `.env`
è git-ignorato: non finirà mai nel repository.

## 3. Collegare Claude Code

Dalla cartella del progetto, sul tuo computer:

```bash
claude mcp add --scope local --transport stdio meta-ads \
  -- node "$(pwd)/tools/mcp-ads/dist/stdio.js"
```

Verifica con `/mcp` dentro Claude Code: `meta-ads` deve risultare connesso.
Poi, come primo comando, chiedi *"verifica l'accesso a Meta"*: risponde con
identità del token, account raggiungibili e guardrail attivi.

Se cambi il codice, ricorda `npm run build` e riavvia Claude Code.

## 4. I tool disponibili

### Lettura

| Tool | Cosa fa |
|---|---|
| `meta_check_access` | Verifica token, elenca account e guardrail. Primo comando per la diagnostica. |
| `meta_list_ad_accounts` | Ad account accessibili, con valuta e speso totale. |
| `meta_list_campaigns` | Campagne di un account: stato, obiettivo, budget. |
| `meta_list_adsets` | Adset di un account o di una campagna. |
| `meta_list_ads` | Inserzioni, con la creatività associata. |
| `meta_insights` | Le performance: spesa, impression, click, CTR, CPC, CPM, reach, conversioni, ROAS. Con `level` scegli il dettaglio (account/campagna/adset/inserzione), con `breakdowns` segmenti per età, piattaforma, paese. |

### Scrittura — sempre con conferma

| Tool | Cosa fa |
|---|---|
| `meta_set_status` | Attiva o mette in pausa campagna, adset o inserzione. |
| `meta_set_budget` | Cambia budget giornaliero o totale di campagna o adset. |

Entrambi, chiamati **senza** `confirm: true`, non modificano nulla: leggono il
valore attuale dal vivo e restituiscono un'anteprima `attuale → richiesto`.
La modifica avviene solo alla seconda chiamata, con `confirm: true`.

In pratica, la conversazione è:

> **Tu:** metti in pausa l'adset che spende più di tutti senza conversioni
> **Claude:** *(legge le performance, individua l'adset)* Sto per mettere in pausa
> "Retargeting 30gg" (id 123): stato attuale ACTIVE, spesa 7 giorni 84,20 EUR,
> 0 conversioni. Confermi?
> **Tu:** sì
> **Claude:** *(ora applica)* Fatto: da ACTIVE a PAUSED.

Gli importi si esprimono sempre in **unità intere di valuta** (`25.5` = 25,50 EUR),
mai in centesimi. La conversione la fa il server, leggendo la valuta dell'account.

## 5. I guardrail

Sono controlli **lato server**: il modello può chiedere qualunque cosa, ma i limiti
li decide il tuo `.env`, non il prompt. Nessuno di essi ha un parametro di override
raggiungibile dai tool.

| Variabile | Effetto |
|---|---|
| `META_ALLOWED_ACCOUNT_IDS` | Solo questi ad account sono raggiungibili. **Consigliato:** protegge dagli id sbagliati. |
| `META_READ_ONLY` | `true` disabilita ogni scrittura. Utile per i primi giorni. |
| `META_MAX_DAILY_BUDGET` | Tetto al budget giornaliero. Una richiesta oltre il tetto viene rifiutata *prima* di qualsiasi chiamata a Meta. |
| `META_MAX_LIFETIME_BUDGET` | Come sopra, per il budget totale. |
| `MCP_ADS_AUDIT_LOG` | File JSONL con una riga per ogni modifica: cosa, quando, valore prima e dopo. |

Per superare un tetto bisogna modificare il file e riavviare il server — cosa che
Claude non può fare da sé.

Un dettaglio utile: l'anteprima mostra sempre il valore attuale letto da Meta.
Se quel valore non corrisponde a quello che vedi in Gestione inserzioni, **non
confermare**: è il segnale che qualcosa non torna (account sbagliato, o valuta
interpretata male).

## 6. Comandi utili

```bash
npm run build       # compila TypeScript in dist/
npm run typecheck   # controlla i tipi senza compilare
npm run dev         # ricompila a ogni salvataggio
npm start           # avvia in stdio (di norma lo fa Claude Code)
npm run start:http  # avvia in modalità HTTP (richiede MCP_AUTH_TOKEN)
```

## 7. Se un giorno lo vuoi online

Serve solo se vuoi usarlo da Claude web o dall'app sul telefono. In locale non
serve a niente.

- **Cloudflare Workers**: `npx wrangler secret put META_ACCESS_TOKEN`, poi
  `npx wrangler secret put MCP_AUTH_TOKEN`, poi `npx wrangler deploy`.
- **Node (Fly.io, Railway, Render, VPS)**: avvia `dist/http.js`, imposta
  `MCP_AUTH_TOKEN` (obbligatorio, minimo 32 caratteri) e `META_ACCESS_TOKEN`
  fra i secret del provider.

In entrambi i casi l'endpoint MCP è protetto da bearer token: senza
`MCP_AUTH_TOKEN` il server HTTP si rifiuta di partire, perché un endpoint aperto
equivarrebbe a lasciare le chiavi dell'account pubblicitario su internet.

## 8. Limiti noti

- **Non testato contro l'API reale.** Il codice è compilato e i guardrail sono
  verificati con test automatici, ma `graph.facebook.com` è irraggiungibile
  dall'ambiente in cui è stato scritto. La prima esecuzione va fatta con
  `meta_check_access` e con `META_READ_ONLY=true`.
- **Versione API**: il default è in `src/config.ts` (`DEFAULT_META_API_VERSION`),
  sovrascrivibile con `META_API_VERSION`. Se Meta segnala una versione deprecata,
  alza quel numero.
- **Budget su campagne con CBO**: se la campagna ottimizza il budget a livello di
  campagna, impostare il budget di un singolo adset viene rifiutato da Meta. Il
  messaggio d'errore viene riportato tale e quale.
- **Valute a decimali non standard**: la conversione usa una tabella statica
  (`src/meta/currency.ts`). Per euro, dollaro e sterlina è corretta. L'anteprima
  serve anche a questo: se il valore attuale mostrato è sbagliato di un fattore
  100, la tabella va corretta.
- **Paginazione**: le letture seguono al massimo 5 pagine. Su account molto grandi
  l'elenco può risultare troncato, e il messaggio lo dice.
