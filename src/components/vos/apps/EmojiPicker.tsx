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

/* Arte SVG inline: nessuna richiesta di rete, niente cache che fallisce */
function Art({ e, pack }: { e: VEmoji; pack: Pack }) {
  const svg = pack === 'fx' ? e.fxSvg : e.omSvg
  if (svg) {
    return (
      <span
        className="vemo-art"
        aria-label={e.name}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    )
  }
  return <span className="vemo-char">{e.char}</span>
}

function Cell({
  e,
  pack,
  onClick,
}: {
  e: VEmoji
  pack: Pack
  onClick: () => void
}) {
  return (
    <button title={`${e.name} — clicca per copiare`} onClick={onClick}>
      <Art e={e} pack={pack} />
    </button>
  )
}

export default function EmojiPicker() {
  const [all, setAll] = useState<VEmoji[]>([])
  const [pack, setPack] = useState<Pack>('om')
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('vos-emoji-recent') ?? '[]')
    } catch {
      return []
    }
  })
  const { toast } = useToast()

  // I dati SVG viaggiano in un chunk separato: caricati solo quando serve
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

  function click(e: VEmoji) {
    navigator.clipboard?.writeText(e.char).catch(() => {})
    const next = [e.char, ...recent.filter((c) => c !== e.char)].slice(0, 16)
    setRecent(next)
    localStorage.setItem('vos-emoji-recent', JSON.stringify(next))
    toast(`Emoji ${e.char} copiata!`)
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
            return <Cell key={char} e={e} pack={pack} onClick={() => click(e)} />
          })}
        </div>
      </>
    ) : null

  return (
    <div className="vemo">
      {tabs}
      {all.length === 0 ? (
        <p className="vemo-empty">Caricamento emoji…</p>
      ) : (
        <>
          {recentSection}
          <div className="vemo-scroll">
            {list.length === 0 && <p className="vemo-empty">Nessuna emoji trovata</p>}
            <div className="vemo-grid">
              {list.map((e) => (
                <Cell key={e.hex} e={e} pack={pack} onClick={() => click(e)} />
              ))}
            </div>
          </div>
        </>
      )}
      <p className="vemo-hint">Clicca una emoji per copiarla negli appunti</p>
    </div>
  )
}
