import { useEffect, useRef, useState } from 'react'
import { Mi } from '../../Mi'
import type { VosConfig } from '../storage'
import { saveVosConfig } from '../storage'

/* ── Terminal ── */
export function TerminalApp() {
  const [lines, setLines] = useState<string[]>(['KairoVOS Terminal v1.0 — digita help'])
  const [input, setInput] = useState('')
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  function run(cmd: string) {
    const c = cmd.trim().toLowerCase()
    const out: string[] = [`$ ${cmd}`]
    if (c === 'help') {
      out.push('help clear date echo apps vos')
    } else if (c === 'clear') {
      setLines([])
      return
    } else if (c === 'date') {
      out.push(new Date().toString())
    } else if (c.startsWith('echo ')) {
      out.push(cmd.slice(5))
    } else if (c === 'apps') {
      out.push('17 app installate nel dock VOS')
    } else if (c === 'vos') {
      out.push('Virtual OS by kairodev.it')
    } else if (c) {
      out.push(`Comando non trovato: ${c}`)
    }
    setLines((l) => [...l, ...out])
  }

  return (
    <div className="vos-app-term">
      <div className="vos-app-term-out">
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        <div ref={end} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          run(input)
          setInput('')
        }}
      >
        <Mi n="chevron_right" />
        <input value={input} onChange={(e) => setInput(e.target.value)} autoFocus spellCheck={false} />
      </form>
    </div>
  )
}

/* ── Calculator ── */
export function CalculatorApp() {
  const [expr, setExpr] = useState('0')
  const keys = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+']

  function press(k: string) {
    if (k === '=') {
      try {
        // eslint-disable-next-line no-new-func
        const v = Function(`"use strict"; return (${expr.replace(/[^0-9+\-*/().]/g, '')})`)()
        setExpr(String(v))
      } catch {
        setExpr('Err')
      }
    } else if (expr === '0' || expr === 'Err') {
      setExpr(k)
    } else {
      setExpr(expr + k)
    }
  }

  return (
    <div className="vos-calc">
      <div className="vos-calc-display">{expr}</div>
      <div className="vos-calc-keys">
        {keys.map((k) => (
          <button key={k} onClick={() => press(k)}>{k}</button>
        ))}
        <button className="wide" onClick={() => setExpr('0')}>C</button>
      </div>
    </div>
  )
}

/* ── Notes ── */
export function NotesApp() {
  const [text, setText] = useState(() => localStorage.getItem('vos-notes') || '')
  useEffect(() => {
    localStorage.setItem('vos-notes', text)
  }, [text])
  return <textarea className="vos-notes" value={text} onChange={(e) => setText(e.target.value)} placeholder="Scrivi una nota…" />
}

/* ── Files ── */
export function FilesApp() {
  const [files] = useState(['Documenti', 'Download', 'Immagini', 'Progetti', 'VOS'])
  return (
    <div className="vos-files">
      {files.map((f) => (
        <div key={f} className="vos-file-row">
          <Mi n="folder" />
          <span>{f}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Navigator ── */
export function NavigatorApp() {
  const [url, setUrl] = useState('https://kairodev.it')
  const [current, setCurrent] = useState(url)
  return (
    <div className="vos-nav">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          let u = url.trim()
          if (!/^https?:\/\//i.test(u)) u = 'https://' + u
          setCurrent(u)
        }}
      >
        <Mi n="language" />
        <input value={url} onChange={(e) => setUrl(e.target.value)} />
        <button type="submit"><Mi n="arrow_forward" /></button>
      </form>
      <iframe src={current} title="Navigator" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
    </div>
  )
}

/* ── Settings ── */
export function SettingsApp({ config }: { config: VosConfig }) {
  const [name, setName] = useState(config.userName)
  const [pwd, setPwd] = useState(config.password)
  const [msg, setMsg] = useState('')

  function save() {
    const next = { ...config, userName: name, password: pwd }
    saveVosConfig(next)
    setMsg('Salvato. Riavvia VOS per applicare al lock screen.')
  }

  return (
    <div className="vos-settings">
      <label>Nome utente</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <label>Password lock screen (vuoto = nessuna)</label>
      <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
      <button className="vps-btn" onClick={save}><Mi n="save" /> Salva</button>
      {msg && <p className="vos-settings-msg">{msg}</p>}
    </div>
  )
}

/* ── Generic placeholders with basic UI ── */
export function MusicApp() {
  const tracks = ['menu', 'boot', 'ambient', 'victory', 'night']
  return (
    <div className="vos-generic">
      {tracks.map((t) => (
        <div key={t} className="vos-generic-row"><Mi n="music_note" /> {t}.wav</div>
      ))}
    </div>
  )
}

export function GalleryApp() {
  return (
    <div className="vos-gallery">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="vos-gallery-cell"><Mi n="image" /></div>
      ))}
    </div>
  )
}

export function CalendarApp() {
  const now = new Date()
  return (
    <div className="vos-calendar">
      <h3>{now.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}</h3>
      <div className="vos-cal-grid">
        {Array.from({ length: 31 }, (_, i) => (
          <span key={i} className={i + 1 === now.getDate() ? 'today' : ''}>{i + 1}</span>
        ))}
      </div>
    </div>
  )
}

export function MailApp() {
  return (
    <div className="vos-generic">
      <div className="vos-generic-row"><Mi n="inbox" /> <b>Benvenuto in VOS Mail</b></div>
      <div className="vos-generic-row"><Mi n="mail" /> Nessun messaggio reale — connetti un server IMAP in futuro.</div>
    </div>
  )
}

export function ClockApp() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="vos-clock-app">
      <div className="vos-clock-big">{now.toLocaleTimeString('it-IT')}</div>
      <div>{now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </div>
  )
}

export function WeatherApp() {
  return (
    <div className="vos-weather">
      <Mi n="cloud" className="vos-weather-icon" />
      <div className="vos-weather-temp">22°</div>
      <p>Parzialmente nuvoloso — Roma</p>
      <small>Dati demo. API meteo in arrivo.</small>
    </div>
  )
}

export function MessagesApp() {
  return (
    <div className="vos-messages">
      <div className="vos-msg-side">
        <div className="vos-msg-item active"><Mi n="person" /> Supporto Kairo</div>
        <div className="vos-msg-item"><Mi n="group" /> Developer Chat</div>
      </div>
      <div className="vos-msg-chat">
        <p>Ciao! Benvenuto in VOS Messages.</p>
      </div>
    </div>
  )
}

export function MonitorApp() {
  const [cpu] = useState(() => 12 + Math.floor(Math.random() * 30))
  return (
    <div className="vos-monitor">
      <div><span>CPU VOS</span><div className="vos-bar"><div style={{ width: `${cpu}%` }} /></div><b>{cpu}%</b></div>
      <div><span>RAM</span><div className="vos-bar"><div style={{ width: '38%' }} /></div><b>98 MB</b></div>
      <div><span>Rete</span><div className="vos-bar"><div style={{ width: '12%' }} /></div><b>Attiva</b></div>
    </div>
  )
}

export function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState('#34e0a1')
  const drawing = useRef(false)

  function pos(e: React.MouseEvent) {
    const c = canvasRef.current!
    const r = c.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function draw(e: React.MouseEvent) {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const p = pos(e)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  return (
    <div className="vos-paint">
      <div className="vos-paint-tools">
        {['#34e0a1', '#b18cff', '#ff7a7a', '#ffc857', '#eef2f9', '#07090d'].map((c) => (
          <button key={c} style={{ background: c }} className={color === c ? 'on' : ''} onClick={() => setColor(c)} />
        ))}
        <button onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 700, 400)}><Mi n="delete" /></button>
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={360}
        onMouseDown={() => { drawing.current = true }}
        onMouseUp={() => { drawing.current = false }}
        onMouseLeave={() => { drawing.current = false }}
        onMouseMove={draw}
      />
    </div>
  )
}
