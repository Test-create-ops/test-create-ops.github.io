import { useEffect, useState } from 'react'
import { Mi } from '../components/Mi'
import { useToast } from '../components/Toast'

const CATALOG_URL =
  'https://raw.githubusercontent.com/Test-create-ops/kairo-store-catalog/main/catalog.json'

interface App {
  name: string
  author?: string
  desc?: string
  version: string
  date?: string
  icon: string
  file: string
  status?: string
}

function AppCard({ a }: { a: App }) {
  return (
    <div className="acard">
      <img
        className="aicon"
        src={a.icon}
        alt=""
        onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
      />
      <div className="aname">{a.name}</div>
      <div className="aauth">di {a.author || 'Kairo'}</div>
      <div className="adesc">{a.desc || ''}</div>
      <div className="ameta">
        v{a.version} · {a.date || ''}
      </div>
      <a className="btn" href={a.file} download>
        <Mi n="download" />
        Installa
      </a>
    </div>
  )
}

/* Preview reale del desktop PixelOS */
function OsMockup() {
  return (
    <div className="os-window">
      <div className="os-titlebar">
        <span className="tl tl-r" /><span className="tl tl-y" /><span className="tl tl-g" />
        <span>PixelOS — desktop reale</span>
      </div>
      <img className="os-shot" src="/preview/reworked_window.png" alt="Desktop di PixelOS con dock e finestra terminale" />
    </div>
  )
}

export function StorePage({ setPage }: { setPage: (p: 'dev') => void }) {
  const [apps, setApps] = useState<App[] | null>(null)
  const [error, setError] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch(CATALOG_URL, { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error('http')
        return r.json()
      })
      .then((data) => setApps((data.apps || []).filter((a: App) => a.status === 'published')))
      .catch(() => {
        setError(true)
        setApps([])
      })
  }, [])

  return (
    <main className="wrap">
      <div className="hero">
        <div className="hero-split">
          <div>
            <span className="badge">
              <span className="dot-live" />
              PixelOS v0.1.0 — disponibile ora
            </span>
            <h1>
              Il sistema operativo che hai costruito <b>da zero</b>.
            </h1>
            <p>
              PixelOS (già KairoOS) è un SO hobby x86-64 con kernel scritto in C e Assembly.
              Boot Multiboot2/PVH, GUI proprietaria con rendering 3D software e tema scuro.
              ISO + kernel + script QEMU, tutto in un pacchetto.
            </p>
            <div style={{ marginTop: 26, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a className="btn big" href="/PixelOS-v0.1.0.zip" download>
                <Mi n="download" />
                Scarica PixelOS v0.1.0
              </a>
              <a className="btn ghost big" href="https://github.com/Test-create-ops/KairoOS-BETA" target="_blank" rel="noopener">
                <Mi n="code" />
                Sorgenti su GitHub
              </a>
            </div>
            <div className="stats-row">
              <div className="stat-chip"><b>x86-64</b><span>architettura</span></div>
              <div className="stat-chip"><b>C + ASM</b><span>linguaggi</span></div>
              <div className="stat-chip"><b>Multiboot2</b><span>boot protocol</span></div>
              <div className="stat-chip"><b>QEMU</b><span>pronto a girare</span></div>
            </div>
          </div>
          <OsMockup />
        </div>
      </div>

      {(apps?.length === 0 || error) && (
        <div className="empty">
          <Mi n={error ? 'cloud_off' : 'apps'} />
          <b>{error ? 'Store non raggiungibile' : 'Lo store è ancora vuoto'}</b>
          <p>
            {error ? (
              <>Non riesco a leggere il catalogo. Riprova tra poco.</>
            ) : (
              <>
                Le app vere appariranno qui quando i developer certificati le pubblicheranno.
                <br />
                Nessuna app demo: solo app reali, create con KairoSDK.
              </>
            )}
          </p>
          {!error && (
            <button className="btn" onClick={() => { toast('Crea un account developer!'); setPage('dev') }}>
              <Mi n="person" />
              Diventa developer
            </button>
          )}
        </div>
      )}

      <div className="agrid">
        {(apps || []).map((a, i) => (
          <AppCard key={i} a={a} />
        ))}
      </div>
    </main>
  )
}
