import { useEffect, useState } from 'react'
import { Mi } from '../../Mi'

/* L'indice completo pesa ~59 MB: proviamo diretto e poi i proxy CORS */
const FDROID_INDEX = 'https://f-droid.org/repo/index-v1.json'
const INDEX_PROXIES = [
  (u: string) => u,
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
]

interface FdApp {
  packageName: string
  name?: { en?: string; it?: string }
  summary?: { en?: string; it?: string }
  icon?: { en?: string }
  localized?: { en?: { name?: string; summary?: string; icon?: { en?: string } } }
}

function appName(a: FdApp): string {
  return a.localized?.en?.name || a.name?.en || a.name?.it || a.packageName
}

function appSummary(a: FdApp): string {
  return a.localized?.en?.summary || a.summary?.en || a.summary?.it || ''
}

function appIcon(a: FdApp): string {
  const path = a.localized?.en?.icon?.en || a.icon?.en
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://f-droid.org/repo/${path}`
}

export default function FPixelStore() {
  const [apps, setApps] = useState<FdApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      let lastErr: unknown = null
      for (const wrap of INDEX_PROXIES) {
        try {
          const r = await fetch(wrap(FDROID_INDEX))
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          const data = await r.json()
          if (!alive) return
          const list: FdApp[] = data?.apps || []
          setApps(list.slice(0, 200))
          setError('')
          setLoading(false)
          return
        } catch (e) {
          lastErr = e
        }
      }
      if (!alive) return
      setError(
        lastErr instanceof Error
          ? `${lastErr.message} — F-Droid blocca le richieste dal browser (CORS)`
          : 'Errore rete',
      )
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  const filtered = apps.filter((a) => {
    const q = query.toLowerCase()
    if (!q) return true
    return appName(a).toLowerCase().includes(q) || a.packageName.toLowerCase().includes(q)
  })

  return (
    <div className="fpixel">
      <div className="fpixel-head">
        <Mi n="shop" />
        <div>
          <b>F-Pixel Store</b>
          <span>Catalogo live da F-Droid — nessuna UI proprietaria</span>
        </div>
      </div>
      <input
        className="fpixel-search"
        placeholder="Cerca app F-Droid…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <p className="fpixel-status"><Mi n="sync" /> Caricamento index.json…</p>}
      {error && <p className="fpixel-err"><Mi n="error" /> {error}</p>}
      <div className="fpixel-list">
        {filtered.map((a) => (
          <a
            key={a.packageName}
            className="fpixel-row"
            href={`https://f-droid.org/packages/${a.packageName}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {appIcon(a) ? (
              <img src={appIcon(a)} alt="" />
            ) : (
              <span className="fpixel-fallback"><Mi n="android" /></span>
            )}
            <div>
              <b>{appName(a)}</b>
              <span>{appSummary(a)}</span>
              <small>{a.packageName}</small>
            </div>
            <Mi n="open_in_new" />
          </a>
        ))}
      </div>
    </div>
  )
}
