import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../Toast'
import { Mi } from '../../Mi'

interface EmojiEntry {
  hex: string
  char: string
  name: string
  group: string
  om: boolean
  fx: boolean
}

type Pack = 'fx' | 'om'

/* Cella emoji: mostra l'immagine del pack; se non carica, usa il carattere nativo */
function Cell({
  entry,
  pack,
  onClick,
}: {
  entry: EmojiEntry
  pack: Pack
  onClick: () => void
}) {
  const [broken, setBroken] = useState(false)
  return (
    <button title={`${entry.name} — clicca per copiare`} onClick={onClick}>
      {!broken ? (
        <img
          src={`/emoji/${pack}/${entry.hex}.svg`}
          alt={entry.char}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="vemo-char">{entry.char}</span>
      )}
    </button>
  )
}

export default function EmojiPicker() {
  const [all, setAll] = useState<EmojiEntry[]>([])
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

  useEffect(() => {
    fetch('/emoji/manifest.json')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setAll(d))
      .catch(() => setAll([]))
  }, [])

  const list = useMemo(
    () =>
      all.filter(
        (e) =>
          e[pack] &&
          (!query ||
            e.name.toLowerCase().includes(query.toLowerCase()) ||
            e.char === query),
      ),
    [all, pack, query],
  )

  const counts = {
    fx: all.filter((e) => e.fx).length,
    om: all.filter((e) => e.om).length,
  }

  function click(e: EmojiEntry) {
    navigator.clipboard?.writeText(e.char).catch(() => {})
    const next = [e.char, ...recent.filter((c) => c !== e.char)].slice(0, 16)
    setRecent(next)
    localStorage.setItem('vos-emoji-recent', JSON.stringify(next))
    toast(`Emoji ${e.char} copiata!`)
  }

  return (
    <div className="vemo">
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

      {recent.length > 0 && !query && (
        <>
          <div className="vemo-sub">
            <Mi n="schedule" /> Recenti
          </div>
          <div className="vemo-grid">
            {recent.map((char) => {
              const e = all.find((x) => x.char === char)
              if (!e || !e[pack]) return null
              return (
                <Cell key={char} entry={e} pack={pack} onClick={() => click(e)} />
              )
            })}
          </div>
        </>
      )}

      <div className="vemo-scroll">
        {list.length === 0 && <p className="vemo-empty">Nessuna emoji trovata</p>}
        <div className="vemo-grid">
          {list.map((e) => (
            <Cell key={e.hex} entry={e} pack={pack} onClick={() => click(e)} />
          ))}
        </div>
      </div>
      <p className="vemo-hint">Clicca una emoji per copiarla negli appunti</p>
    </div>
  )
}
