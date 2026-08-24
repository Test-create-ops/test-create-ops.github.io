import { useEffect, useState } from 'react'
import { Mi } from '../Mi'

const LINES = [
  'Inizializzazione kernel VOS…',
  'Caricamento driver grafici…',
  'Montaggio filesystem virtuale…',
  'Avvio servizi di rete…',
  'Preparazione desktop…',
]

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [line, setLine] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 2 + Math.random() * 4)
        if (next >= 100) {
          clearInterval(t)
          setTimeout(onDone, 400)
        }
        return next
      })
    }, 60)
    return () => clearInterval(t)
  }, [onDone])

  useEffect(() => {
    setLine(Math.min(LINES.length - 1, Math.floor((progress / 100) * LINES.length)))
  }, [progress])

  return (
    <div className="vos-boot">
      <div className="vos-boot-logo">
        <Mi n="memory" className="vos-boot-icon" />
        <h1>Kairo<b>VOS</b></h1>
        <p>Virtual Operating System</p>
      </div>
      <div className="vos-boot-bar">
        <div className="vos-boot-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="vos-boot-log">
        <Mi n="sync" />
        {LINES[line]}
      </div>
    </div>
  )
}
