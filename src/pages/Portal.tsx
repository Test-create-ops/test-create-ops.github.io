import { useEffect, useState } from 'react'
import { Mi } from '../components/Mi'
import { useAuth } from '../lib/auth'
import { useToast } from '../components/Toast'

const CATALOG_URL = 'https://raw.githubusercontent.com/Test-create-ops/kairo-store-catalog/main/catalog.json'
const PENDING_URL = 'https://raw.githubusercontent.com/Test-create-ops/kairo-store-catalog/main/pending.json'

interface App {
  name: string; author?: string; desc?: string; version: string;
  date?: string; icon: string; file: string; status?: string
}

const MENU: { id: string; m: string; n: string }[] = [
  { id: 'guide', m: 'menu_book', n: 'Come sviluppare' },
  { id: 'app', m: 'apps', n: 'App' },
  { id: 'publish', m: 'upload', n: 'Pubblica' },
  { id: 'revisioned', m: 'schedule', n: 'In revisione' },
  { id: 'analytics', m: 'insights', n: 'Analytics' },
  { id: 'payout', m: 'payments', n: 'Pagamenti' },
  { id: 'bank', m: 'account_balance', n: 'Dati bancari' },
  { id: 'cert', m: 'verified_user', n: 'Certificazione' },
  { id: 'team', m: 'groups', n: 'Team' },
  { id: 'builds', m: 'build', n: 'Build' },
  { id: 'releases', m: 'rocket_launch', n: 'Release' },
  { id: 'testing', m: 'science', n: 'Test' },
  { id: 'signing', m: 'draw', n: 'Firma' },
  { id: 'icons', m: 'image', n: 'Icone' },
  { id: 'screens', m: 'photo_camera', n: 'Screenshot' },
  { id: 'description', m: 'description', n: 'Descrizione' },
  { id: 'pricing', m: 'sell', n: 'Prezzi' },
  { id: 'iap', m: 'shopping_cart', n: 'Acquisti in-app' },
  { id: 'subs', m: 'autorenew', n: 'Abbonamenti' },
  { id: 'ads', m: 'campaign', n: 'Pubblicità' },
  { id: 'reviews', m: 'rate_review', n: 'Recensioni' },
  { id: 'ratings', m: 'star', n: 'Valutazioni' },
  { id: 'crashes', m: 'bug_report', n: 'Crash report' },
  { id: 'perf', m: 'speed', n: 'Performance' },
  { id: 'privacy', m: 'privacy_tip', n: 'Privacy' },
  { id: 'safety', m: 'security', n: 'Data safety' },
  { id: 'target', m: 'track_changes', n: 'Targeting' },
  { id: 'localize', m: 'language', n: 'Localizzazione' },
  { id: 'translate', m: 'translate', n: 'Traduzioni' },
  { id: 'catalog', m: 'grid_view', n: 'Catalogo' },
  { id: 'listing', m: 'storefront', n: 'Store listing' },
  { id: 'experiment', m: 'science', n: 'Esperimenti' },
  { id: 'rollout', m: 'trending_up', n: 'Rollout' },
  { id: 'badges', m: 'workspace_premium', n: 'Badge' },
  { id: 'early', m: 'rocket_launch', n: 'Early access' },
  { id: 'archive', m: 'inventory_2', n: 'Archivio' },
  { id: 'policies', m: 'policy', n: 'Politiche' },
  { id: 'legal', m: 'gavel', n: 'Legale' },
  { id: 'tax', m: 'receipt_long', n: 'Tasse' },
  { id: 'keys', m: 'key', n: 'Chiavi' },
  { id: 'creds', m: 'badge', n: 'Credenziali' },
  { id: 'apikey', m: 'vpn_key', n: 'API key' },
  { id: 'push', m: 'notifications_active', n: 'Notifiche push' },
  { id: 'deep', m: 'link', n: 'Deep link' },
  { id: 'webhook', m: 'hub', n: 'Webhook' },
  { id: 'support', m: 'support_agent', n: 'Supporto' },
  { id: 'docs', m: 'menu_book', n: 'Documentazione' },
  { id: 'terms', m: 'article', n: 'Termini' },
  { id: 'history', m: 'history', n: 'Cronologia versioni' },
  { id: 'activity', m: 'list_alt', n: 'Registro attività' },
  { id: 'messages', m: 'mail', n: 'Messaggi' },
  { id: 'reports', m: 'assessment', n: 'Report' },
]

const ICONS = ['airplane','alarm','app','arrow-right','back','battery','bell','bluetooth','calendar',
'camera','cart','check','clock','close','cloud','code','down','download','edit','eye','file','folder',
'gift','heart','help','home','image','info','key','link','list','lock','logout','mail','menu','message',
'mic','minus','moon','more','music','pause','phone','pin','play','plus','power','print','refresh','save',
'search','send','settings','share','shield','signal','star','sun','terminal','trash','up','upload','user',
'volume','wallet','warning','wifi','world']

function AppCard({ a }: { a: App }) {
  return (
    <div className="acard">
      <img className="aicon" src={a.icon} alt="" onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
      <div className="aname">{a.name}</div>
      <div className="aauth">di {a.author || 'Kairo'}</div>
      <div className="adesc">{a.desc || ''}</div>
      <div className="ameta">v{a.version} · {a.date || ''}</div>
      <a className="btn" href={a.file} download><Mi n="download" />Installa</a>
    </div>
  )
}

function useMyApps(url: string) {
  const [apps, setApps] = useState<App[] | null>(null)
  const [err, setErr] = useState(false)
  const { profile } = useAuth()
  useEffect(() => {
    fetch(url, { cache: 'no-cache' })
      .then((r) => { if (!r.ok) throw new Error('x'); return r.json() })
      .then((data) => {
        const my = profile?.username.toLowerCase() || ''
        setApps(my ? (data.apps || []).filter((a: App) => a.author && a.author.toLowerCase() === my) : [])
      })
      .catch(() => setErr(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { apps, err }
}

export default function Portal() {
  const [sel, setSel] = useState('app')
  const [search, setSearch] = useState('')
  const { toast } = useToast()
  const item = MENU.find((m) => m.id === sel)!

  return (
    <main className="wrap">
      <div className="portal">
        <aside className="side">
          <div className="stitle"><Mi n="code" />Developer Portal</div>
          {MENU.map((m) => (
            <button key={m.id} className={sel === m.id ? 'on' : ''} onClick={() => setSel(m.id)}>
              <Mi n={m.m} />{m.n}
            </button>
          ))}
        </aside>

        <div className="panel">
          {sel === 'app' && <AppsPanel />}
          {sel === 'revisioned' && <ReviewPanel />}
          {sel === 'publish' && <PublishPanel toast={toast} />}
          {(sel === 'guide' || sel === 'docs') && (
            <>
              <h2><Mi n="menu_book" />Come si sviluppano le app</h2>
              <div className="sub">Tutto quello che serve per creare e pubblicare app su Kairo Store.</div>
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8 }}><Mi n="code" /> Linguaggio e strumenti</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.9 }}>
                  Le app di Kairo Store si sviluppano in <b style={{ color: 'var(--text)' }}>C</b> con{' '}
                  <b style={{ color: 'var(--text)' }}>KairoCode</b>, l'IDE di Kairo, usando il{' '}
                  <b style={{ color: 'var(--text)' }}>KairoSDK</b>.<br />
                  KairoCode scarica e installa il KairoSDK da solo, crea il progetto con i file già pronti,
                  compila ed esegue e prepara la pubblicazione sullo store.
                </p>
              </div>
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 8 }}><Mi n="verified_user" /> Passaggi per diventare developer</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.9 }}>
                  1. Accedi con Google.<br />
                  2. Richiedi la certificazione: il codice personale arriva via email.<br />
                  3. Attivala inserendo il codice (e caricando il certificato).<br />
                  4. Scarica KairoCode + il KairoSDK e inizia a creare.
                </p>
              </div>
              <div className="card">
                <h3 style={{ marginBottom: 8 }}><Mi n="upload" /> Pubblicare un'app</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.9 }}>
                  Dal pannello <b style={{ color: 'var(--text)' }}>Pubblica</b> scarichi il{' '}
                  <b style={{ color: 'var(--text)' }}>manifest.json</b>, crei una pull request sulla repo del catalogo
                  e dopo la revisione l'app compare nello store con il bottone <b style={{ color: 'var(--text)' }}>Installa</b>.
                </p>
              </div>
            </>
          )}
          {sel === 'icons' && (
            <>
              <h2><Mi n="image" />Icone</h2>
              <div className="sub">Tutte le {ICONS.length} icone built-in di KairoSDK. Clicca per copiare il nome.</div>
              <input type="text" id="iconSearch" placeholder="Cerca un'icona..." value={search}
                onChange={(e) => setSearch(e.target.value)} />
              <div className="igrid">
                {ICONS.filter((n) => n.includes(search.toLowerCase())).map((n) => (
                  <button key={n} className="icell" title="Clicca per copiare il nome"
                    onClick={() => { navigator.clipboard?.writeText(n); toast('Copiata: ' + n) }}>
                    <img src={`/icons/${n}.png`} alt={n} /><span>{n}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {!['app', 'revisioned', 'publish', 'guide', 'docs', 'icons'].includes(sel) && (
            <>
              <h2><Mi n={item.m} />{item.n}</h2>
              <div className="sub">Kairo Developer Portal</div>
              <div className="placeholder">
                <Mi n="more_horiz" />
                <div>Sezione "{item.n}" in costruzione.</div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function AppsPanel() {
  const { apps, err } = useMyApps(CATALOG_URL)
  return (
    <>
      <h2><Mi n="apps" />Le tue app</h2>
      <div className="sub">Le app che hai pubblicato su Kairo Store.</div>
      {apps === null && !err && <div className="empty" style={{ padding: '44px 20px' }}><Mi n="apps" /><b>Caricamento...</b></div>}
      {err && <div className="empty" style={{ padding: '44px 20px' }}><Mi n="cloud_off" /><b>Store non raggiungibile</b><p>Riprova tra poco.</p></div>}
      {apps !== null && !err && apps.length === 0 && (
        <div className="empty" style={{ padding: '44px 20px' }}>
          <Mi n="apps" /><b>Nessuna app pubblicata</b>
          <p>Crea la tua prima app con KairoSDK e pubblicala dal pannello <b>Pubblica</b>.</p>
        </div>
      )}
      {apps !== null && apps.length > 0 && (
        <div className="agrid">{apps.map((a, i) => <AppCard key={i} a={a} />)}</div>
      )}
    </>
  )
}

function ReviewPanel() {
  const { apps, err } = useMyApps(PENDING_URL)
  return (
    <>
      <h2><Mi n="schedule" />App in revisione</h2>
      <div className="sub">Queste app stanno ancora passando la revisione.</div>
      {apps === null && !err && <div className="empty" style={{ padding: '44px 20px' }}><Mi n="schedule" /><b>Caricamento...</b></div>}
      {err && <div className="empty" style={{ padding: '44px 20px' }}><Mi n="cloud_off" /><b>Store non raggiungibile</b><p>Riprova tra poco.</p></div>}
      {apps !== null && !err && apps.length === 0 && (
        <div className="empty" style={{ padding: '44px 20px' }}>
          <Mi n="schedule" /><b>Nessuna app in revisione</b>
          <p>Quando invii un'app, la vedrai qui mentre viene revisionata.</p>
        </div>
      )}
      {apps !== null && apps.length > 0 && (
        <div className="agrid">{apps.map((a, i) => <AppCard key={i} a={a} />)}</div>
      )}
    </>
  )
}

function PublishPanel({ toast }: { toast: (m: string) => void }) {
  const { profile } = useAuth()
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const id = String(f.get('pubId') || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const manifest = {
      id,
      name: String(f.get('pubName') || ''),
      author: profile?.username || '',
      version: String(f.get('pubVer') || '') || '1.0.0',
      desc: String(f.get('pubDesc') || ''),
      icon: String(f.get('pubIcon') || '') || 'icon.png',
      file: String(f.get('pubFile') || ''),
      status: 'pending',
      date: new Date().toISOString().slice(0, 10),
    }
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'manifest.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1500)
    toast('manifest.json scaricato')
  }
  return (
    <>
      <h2><Mi n="upload" />Pubblica un'app</h2>
      <div className="sub">Prepara i file dell'app da pubblicare su Kairo Store. Ogni pubblicazione passa prima dalla revisione.</div>
      <div className="card" style={{ marginBottom: 18, borderColor: 'var(--accent-border)' }}>
        <h3 style={{ marginBottom: 8 }}><Mi n="code" /> Prima di pubblicare</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.9 }}>
          Le app devono essere sviluppate in <b style={{ color: 'var(--text)' }}>C</b> dentro{' '}
          <b style={{ color: 'var(--text)' }}>KairoCode</b>, l'IDE di Kairo. Scaricalo dalla sezione developer:
          ti dà tutto già pronto, compila, esegue e prepara la pubblicazione.
        </p>
      </div>
      <form onSubmit={onSubmit}>
        <label>Nome dell'app</label>
        <input type="text" name="pubName" placeholder="es. Il Mio Gioco" required />
        <label>ID (minuscolo, senza spazi)</label>
        <input type="text" name="pubId" placeholder="es. il-mio-gioco" required />
        <label>Descrizione</label>
        <input type="text" name="pubDesc" placeholder="Una breve descrizione..." />
        <label>Versione</label>
        <input type="text" name="pubVer" defaultValue="1.0.0" />
        <label>Nome del file dell'app (nella cartella)</label>
        <input type="text" name="pubFile" placeholder="es. gioco.zip" required />
        <label>Nome dell'icona PNG (nella cartella)</label>
        <input type="text" name="pubIcon" defaultValue="icon.png" />
        <div style={{ marginTop: 20 }}>
          <button className="btn" type="submit"><Mi n="download" />Scarica manifest.json</button>
        </div>
      </form>
      <div className="card" style={{ marginTop: 22 }}>
        <h3 style={{ marginBottom: 8 }}><Mi n="fact_check" /> Come si pubblica</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.9 }}>
          1. Crea una cartella <b style={{ color: 'var(--text)' }}>apps/&lt;id&gt;/</b> nella repo del catalogo.<br />
          2. Metti dentro <b style={{ color: 'var(--text)' }}>manifest.json</b> (scaricato qui), l'icona{' '}
          <b style={{ color: 'var(--text)' }}>.png</b> e il file dell'app.<br />
          3. Apri una <b style={{ color: 'var(--text)' }}>pull request</b> su GitHub: è la revisione.<br />
          4. Appena approvata, l'app compare nello store con il bottone <b style={{ color: 'var(--text)' }}>Installa</b>.
        </p>
        <a className="btn ghost" href="https://github.com/Test-create-ops/kairo-store-catalog" target="_blank"
          rel="noopener" style={{ marginTop: 6 }}><Mi n="code" />Apri la repo del catalogo</a>
      </div>
    </>
  )
}
