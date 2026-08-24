import { useEffect, useRef, useState } from 'react'
import type { SacAppData } from '../storage'

/* ── 2048 / Puzzle ── */
export function TplPuzzle({ app }: { app: SacAppData }) {
  const [grid, setGrid] = useState<number[]>(() => spawn(spawn(Array(16).fill(0))))
  const [score, setScore] = useState(0)

  function spawn(g: number[]): number[] {
    const empty = g.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0)
    if (!empty.length) return g
    const g2 = [...g]
    g2[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4
    return g2
  }

  function move(dir: 'l' | 'r' | 'u' | 'd') {
    setGrid((old) => {
      const get = (r: number, c: number) => old[r * 4 + c]
      let gained = 0
      const out = Array(16).fill(0)
      for (let line = 0; line < 4; line++) {
        const vals: number[] = []
        for (let i = 0; i < 4; i++) {
          const v =
            dir === 'l' ? get(line, i) : dir === 'r' ? get(line, 3 - i) : dir === 'u' ? get(i, line) : get(3 - i, line)
          if (v) vals.push(v)
        }
        const merged: number[] = []
        for (let i = 0; i < vals.length; i++) {
          if (vals[i] === vals[i + 1]) {
            merged.push(vals[i] * 2)
            gained += vals[i] * 2
            i++
          } else merged.push(vals[i])
        }
        while (merged.length < 4) merged.push(0)
        for (let i = 0; i < 4; i++) {
          if (dir === 'l') out[line * 4 + i] = merged[i]
          else if (dir === 'r') out[line * 4 + (3 - i)] = merged[i]
          else if (dir === 'u') out[i * 4 + line] = merged[i]
          else out[(3 - i) * 4 + line] = merged[i]
        }
      }
      if (gained) setScore((s) => s + gained)
      const changed = out.some((v, i) => v !== old[i])
      return changed ? spawn(out) : old
    })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, 'l' | 'r' | 'u' | 'd'> = {
        ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd',
      }
      if (map[e.key]) {
        e.preventDefault()
        move(map[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const colors: Record<number, string> = {
    2: '#3a3a55', 4: '#45456a', 8: '#5b7fd4', 16: '#6c5ce7', 32: '#89b4fa',
    64: '#f9e2af', 128: '#a6e3a1', 256: '#94e2d5', 512: '#f5c2e7', 1024: '#fab387', 2048: '#f38ba8',
  }

  return (
    <div className="tpl tpl-puzzle">
      <div className="tpl-puzzle-top">
        <b>{app.name}</b>
        <span>Punti: {score}</span>
        <button className="tpl-btn" onClick={() => { setGrid(spawn(spawn(Array(16).fill(0)))); setScore(0) }}>
          Ricomincia
        </button>
      </div>
      <div className="tpl-puzzle-grid">
        {grid.map((v, i) => (
          <div key={i} className="tpl-cell" style={v ? { background: colors[v] ?? '#f38ba8' } : undefined}>
            {v || ''}
          </div>
        ))}
      </div>
      <small>Frecce della tastiera per muovere</small>
    </div>
  )
}

/* ── Snake ── */
export function TplSnake({ app }: { app: SacAppData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [over, setOver] = useState(false)
  const [points, setPoints] = useState(0)
  const state = useRef({
    snake: [{ x: 5, y: 5 }],
    dir: { x: 1, y: 0 },
    food: { x: 12, y: 5 },
    dead: false,
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = state.current
      if (e.key === 'ArrowUp' && s.dir.y === 0) s.dir = { x: 0, y: -1 }
      if (e.key === 'ArrowDown' && s.dir.y === 0) s.dir = { x: 0, y: 1 }
      if (e.key === 'ArrowLeft' && s.dir.x === 0) s.dir = { x: -1, y: 0 }
      if (e.key === 'ArrowRight' && s.dir.x === 0) s.dir = { x: 1, y: 0 }
    }
    window.addEventListener('keydown', onKey)
    const ctx = canvasRef.current?.getContext('2d')
    const cell = 20
    const iv = setInterval(() => {
      if (!ctx || state.current.dead) return
      const s = state.current
      const head = { x: (s.snake[0].x + s.dir.x + 15) % 15, y: (s.snake[0].y + s.dir.y + 10) % 10 }
      if (s.snake.some((p) => p.x === head.x && p.y === head.y)) {
        s.dead = true
        setOver(true)
        return
      }
      s.snake.unshift(head)
      if (head.x === s.food.x && head.y === s.food.y) {
        setPoints((p) => p + 1)
        s.food = { x: Math.floor(Math.random() * 15), y: Math.floor(Math.random() * 10) }
      } else s.snake.pop()

      ctx.fillStyle = '#10131c'
      ctx.fillRect(0, 0, 300, 200)
      ctx.fillStyle = '#f38ba8'
      ctx.fillRect(s.food.x * cell + 3, s.food.y * cell + 3, cell - 6, cell - 6)
      s.snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? '#a6e3a1' : '#89b4fa'
        ctx.fillRect(p.x * cell + 2, p.y * cell + 2, cell - 4, cell - 4)
      })
    }, 130)
    return () => {
      clearInterval(iv)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  function restart() {
    state.current = { snake: [{ x: 5, y: 5 }], dir: { x: 1, y: 0 }, food: { x: 12, y: 5 }, dead: false }
    setOver(false)
    setPoints(0)
  }

  return (
    <div className="tpl tpl-snake">
      <div className="tpl-puzzle-top">
        <b>{app.name}</b>
        <span>Punti: {points}</span>
        <button className="tpl-btn" onClick={restart}>Ricomincia</button>
      </div>
      <canvas ref={canvasRef} width={300} height={200} />
      {over && <p className="tpl-over">Game Over — premi Ricomincia</p>}
      {!over && <small>Frecce della tastiera</small>}
    </div>
  )
}

/* ── Notes ── */
export function TplNotes({ app }: { app: SacAppData }) {
  const key = `sac-notes-${app.pkg}`
  const [text, setText] = useState(() => localStorage.getItem(key) ?? '')
  useEffect(() => {
    localStorage.setItem(key, text)
  }, [key, text])
  return (
    <div className="tpl">
      <div className="tpl-puzzle-top"><b>{app.name}</b><span>salvato in VOS</span></div>
      <textarea className="tpl-notes" value={text} onChange={(e) => setText(e.target.value)} placeholder="Scrivi qui…" />
    </div>
  )
}

/* ── Orologio/Cronometro ── */
export function TplClock({ app }: { app: SacAppData }) {
  const [now, setNow] = useState(new Date())
  const [sw, setSw] = useState(0)
  const [run, setRun] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 500)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (!run) return
    const t = setInterval(() => setSw((s) => s + 100), 100)
    return () => clearInterval(t)
  }, [run])

  const secs = Math.floor(sw / 1000)
  const fmt = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}.${Math.floor((sw % 1000) / 100)}`
  return (
    <div className="tpl tpl-center">
      <b>{app.name}</b>
      <div className="tpl-clock">{now.toLocaleTimeString('it-IT')}</div>
      <div className="tpl-sw">{fmt}</div>
      <div className="tpl-row">
        <button className="tpl-btn" onClick={() => setRun(!run)}>{run ? 'Pausa' : 'Avvia'}</button>
        <button className="tpl-btn" onClick={() => { setRun(false); setSw(0) }}>Azzera</button>
      </div>
    </div>
  )
}

/* ── Utilità generica ── */
export function TplUtility({ app }: { app: SacAppData }) {
  const calc = (a: string, op: string, b: string) => {
    const x = parseFloat(a), y = parseFloat(b)
    if (isNaN(x) || isNaN(y)) return '?'
    return op === '+' ? x + y : op === '-' ? x - y : op === '×' ? x * y : y === 0 ? '?' : x / y
  }
  const [a, setA] = useState('')
  const [op, setOp] = useState('+')
  const [b, setB] = useState('')
  return (
    <div className="tpl tpl-center">
      <b>{app.name}</b>
      <div className="tpl-calc">
        <input value={a} onChange={(e) => setA(e.target.value)} placeholder="0" inputMode="decimal" />
        <select value={op} onChange={(e) => setOp(e.target.value)}>
          <option>+</option><option>-</option><option>×</option><option>÷</option>
        </select>
        <input value={b} onChange={(e) => setB(e.target.value)} placeholder="0" inputMode="decimal" />
        <span>= {calc(a, op, b)}</span>
      </div>
      <small>Versione template SAC · dati APK: v{app.version}</small>
    </div>
  )
}
