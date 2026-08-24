import { useEffect, useState } from 'react'
import { Mi } from '../../Mi'
import { SUPABASE_URL } from '../../../lib/supabase'
import { installSacApk, SacError } from './sac'
import { loadSacApps } from '../storage'

/* Il catalogo arriva dalla Edge Function "fdroid": scarica l'indice
   completo lato server e restituisce solo i primi 200 app (~100 KB),
   senza problemi di CORS. */
const FDROID_ENDPOINT = SUPABASE_URL + '/functions/v1/fdroid'

interface FdApp {
  packageName: string
  name: string
  summary: string
  icon: string
}

export default function FPixelStore() {
  const [apps, setApps] = useState<FdApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [installing, setInstalling] = useState<string | null>(null)
  const [installed, setInstalled] = useState<string[]>(() => loadSacApps().map((a) => a.pkg))

  async function install(pkg: string) {
    if (installing) return
    setInstalling(pkg)
    try {
      await installSacApk(pkg)
      setInstalled(loadSacApps().map((a) => a.pkg))
    } catch (e) {
      setError(e instanceof SacError ? e.message : 'Installazione fallita')
    } finally {
      setInstalling(null)
    }
  }

  useEffect(() => {
    let alive = true
    fetch(FDROID_ENDPOINT)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (!alive) return
        if (data?.error) throw new Error(data.error)
        setApps((data?.apps ?? []) as FdApp[])
        setLoading(false)
      })
      .catch((e) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Errore rete')
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const filtered = apps.filter((a) => {
    const q = query.toLowerCase()
    if (!q) return true
    return a.name.toLowerCase().includes(q) || a.packageName.toLowerCase().includes(q)
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
      {loading && <p className="fpixel-status"><Mi n="sync" /> Caricamento catalogo…</p>}
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
            {a.icon ? (
              <img src={a.icon} alt="" loading="lazy" />
            ) : (
              <span className="fpixel-fallback"><Mi n="android" /></span>
            )}
            <div>
              <b>{a.name}</b>
              <span>{a.summary}</span>
              <small>{a.packageName}</small>
            </div>
            <button
              className={`fpixel-install ${installed.includes(a.packageName) ? 'done' : ''}`}
              disabled={installing !== null}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                install(a.packageName)
              }}
              title="Installa in VOS con SAC"
            >
              {installing === a.packageName ? (
                <Mi n="sync" />
              ) : installed.includes(a.packageName) ? (
                <Mi n="check" />
              ) : (
                <Mi n="download" />
              )}
            </button>
            <Mi n="open_in_new" />
          </a>
        ))}
      </div>
    </div>
  )
}
