import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useToast } from '../../Toast'
import { Mi } from '../../Mi'

interface VEmoji {
  hex: string
  char: string
  name: string
  group: string
  fx: boolean
  om: boolean
  fxSvg: string
  omSvg: string
}

type Pack = 'fx' | 'om'
type CopyMode = 'text' | 'image'

function Art({ e, pack }: { e: VEmoji; pack: Pack }) {
  const svg = pack === 'fx' ? e.fxSvg : e.omSvg
  if (svg) {
    return (
      <span className="vemo-art" aria-label={e.name} dangerouslySetInnerHTML={{ __html: svg }} />
    )
  }
  return <span className="vemo-char">{e.char}</span>
}

/* Rasterizza l'SVG del pack in PNG */
async function svgToPngBlob(svg: string, size = 128): Promise<Blob> {
  const blobUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try {
    const img = new Image()
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej(new Error('svg load'))
      img.src = blobUrl
    })
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, size, size)
    return await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/png'),
    )
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

function Cell({
  e,
  pack,
  mode,
  onClick,
}: {
  e: VEmoji
  pack: Pack
  mode: CopyMode
  onClick: () => void
}) {
  return (
    <button
      title={mode === 'image' ? `${e.name} — copia immagine` : `${e.name} — copia carattere`}
      onClick={onClick}
    >
      <Art e={e} pack={pack} />
      {mode === 'image' && <span className="vemo-badge"><Mi n="image" /></span>}
    </button>
  )
}

export default function EmojiPicker() {
  const [all, setAll] = useState<VEmoji[]>([])
  const [pack, setPack] = useState<Pack>('om')
  const [mode, setMode] = useState<CopyMode>('text')
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('vos-emoji-recent') ?? '[]')
    } catch {
      return []
    }
  })
  const { toast } = useToast()

  useEffect(() => {
    let alive = true
    import('./emojiData').then((m) => {
      if (alive) setAll(m.EMOJIS)
    })
    return () => {
      alive = false
    }
  }, [])

  const list = useMemo(
    () =>
      all.filter(
        (e) =>
          e[pack] &&
          (!query || e.name.toLowerCase().includes(query.toLowerCase()) || e.char === query),
      ),
    [all, pack, query],
  )

  const counts = {
    fx: all.filter((e) => e.fx).length,
    om: all.filter((e) => e.om).length,
  }

  async function copyImage(e: VEmoji) {
    const svg = pack === 'fx' ? e.fxSvg : e.omSvg
    if (!svg) return toast('Nessuna immagine per questa emoji')
    try {
      const png = await svgToPngBlob(svg)
      // Safari richiede che ClipboardItem venga creato dentro il gesto utente:
      // usiamo la promise form direttamente supportata da Chrome/Safari moderni
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': png }),
      ])
      toast('Immagine copiata! Incolla dove vuoi')
    } catch {
      // Fallback: scarico il PNG
      const a = document.createElement('a')
      a.href = URL.createObjectURL(await svgToPngBlob(svg))
      a.download = `${e.hex}.png`
      a.click()
      toast('Clipboard non disponibile — PNG scaricato')
    }
  }

  function click(e: VEmoji) {
    if (mode === 'image') {
      copyImage(e)
      return
    }
    navigator.clipboard?.writeText(e.char).catch(() => {})
    const next = [e.char, ...recent.filter((c) => c !== e.char)].slice(0, 16)
    setRecent(next)
    localStorage.setItem('vos-emoji-recent', JSON.stringify(next))
    toast(`Emoji ${e.char} copiata! (il disegno dipende dall'app di destinazione)`)
  }

  const tabs: ReactNode = (
    <div className="vemo-tabs">
      <button className={pack === 'fx' ? 'on' : ''} onClick={() => setPack('fx')}>
        <Mi n="mood" /> fxemoji <small>{counts.fx}</small>
      </button>
      <button className={pack === 'om' ? 'on' : ''} onClick={() => setPack('om')}>
        <Mi n="sentiment_satisfied" /> OpenMoji <small>{counts.om}</small>
      </button>
      <input
        className="vemo-search"
        placeholder="Cerca…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  )

  const recentSection =
    recent.length > 0 && !query ? (
      <>
        <div className="vemo-sub">
          <Mi n="schedule" /> Recenti
        </div>
        <div className="vemo-grid">
          {recent.map((char) => {
            const e = all.find((x) => x.char === char)
            if (!e || !e[pack]) return null
            return <Cell key={char} e={e} pack={pack} mode={mode} onClick={() => click(e)} />
          })}
        </div>
      </>
    ) : null

  return (
    <div className="vemo">
      {tabs}

      <div className="vemo-modebar">
        <span>Copia come:</span>
        <button className={!mode || mode === 'text' ? 'on' : ''} onClick={() => setMode('text')}>
          <Mi n="text_fields" /> Testo
        </button>
        <button className={mode === 'image' ? 'on' : ''} onClick={() => setMode('image')}>
          <Mi n="image" /> Immagine
        </button>
      </div>

      {all.length === 0 ? (
        <p className="vemo-empty">Caricamento emoji…</p>
      ) : (
        <>
          {recentSection}
          <div className="vemo-scroll">
            {list.length === 0 && <p className="vemo-empty">Nessuna emoji trovata</p>}
            <div className="vemo-grid">
              {list.map((e) => (
                <Cell key={e.hex} e={e} pack={pack} mode={mode} onClick={() => click(e)} />
              ))}
            </div>
          </div>
        </>
      )}
      <p className="vemo-hint">
        {mode === 'text'
          ? 'Testo: il disegno lo sceglie l’app dove incolli (su Mac = Apple)'
          : 'Immagine: incolla il disegno vero di fx/OpenMoji'}
      </p>
    </div>
  )
}
