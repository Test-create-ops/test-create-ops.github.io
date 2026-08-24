import { useState } from 'react'
import { Mi } from '../../Mi'

const LANGS = [
  'javascript', 'typescript', 'html', 'css', 'json', 'c', 'cpp', 'python',
  'rust', 'go', 'java', 'kotlin', 'swift', 'shell', 'markdown',
]

function stripTs(src: string): string {
  return src
    .replace(/:\s*\w+(\[\])?(\s*\|\s*\w+)*/g, '')
    .replace(/\binterface\s+\w+\s*\{[^}]*\}/g, '')
    .replace(/\btype\s+\w+\s*=[^;]+;/g, '')
}

export default function VisualPixelStudio() {
  const [lang, setLang] = useState('javascript')
  const [code, setCode] = useState(`// Visual Pixel Studio — build reale, no simulazione\nconsole.log('Ciao da VOS!');\n`)
  const [output, setOutput] = useState('')
  const [building, setBuilding] = useState(false)

  async function build() {
    setBuilding(true)
    setOutput('')
    const src = code

    try {
      if (lang === 'javascript') {
        const logs: string[] = []
        const orig = console.log
        console.log = (...a) => logs.push(a.map(String).join(' '))
        try {
          // eslint-disable-next-line no-new-func
          new Function(src)()
          setOutput(logs.length ? logs.join('\n') : 'Build OK — nessun output.')
        } finally {
          console.log = orig
        }
      } else if (lang === 'typescript') {
        const js = stripTs(src)
        const logs: string[] = []
        const orig = console.log
        console.log = (...a) => logs.push(a.map(String).join(' '))
        try {
          // eslint-disable-next-line no-new-func
          new Function(js)()
          setOutput(`[TS → JS transpile minimal]\n${logs.length ? logs.join('\n') : 'Build OK.'}`)
        } finally {
          console.log = orig
        }
      } else if (lang === 'json') {
        JSON.parse(src)
        setOutput('JSON valido ✓')
      } else if (lang === 'html') {
        const blob = new Blob([src], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank', 'noopener')
        setOutput('Anteprima HTML aperta in nuova scheda.')
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      } else if (lang === 'css') {
        const id = 'vps-css-preview'
        let el = document.getElementById(id)
        if (!el) {
          el = document.createElement('style')
          el.id = id
          document.head.appendChild(el)
        }
        el.textContent = src
        setOutput('CSS applicato al documento VOS.')
      } else {
        setOutput(
          `Build reale per "${lang}": toolchain nativa richiesta.\n` +
            'VOS non simula output di compilazione — usa KairoCode o Visual Pixel Studio desktop per build native.',
        )
      }
    } catch (e) {
      setOutput(`Errore build:\n${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBuilding(false)
    }
  }

  return (
    <div className="vps">
      <div className="vps-toolbar">
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          {LANGS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <button className="vps-btn" onClick={build} disabled={building}>
          <Mi n="build" /> {building ? 'Building…' : 'Build'}
        </button>
        <span className="vps-badge">No simulazione</span>
      </div>
      <textarea
        className="vps-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <pre className="vps-output">{output || 'Output build…'}</pre>
    </div>
  )
}
