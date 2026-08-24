import { useEffect, useState } from 'react'
import { Mi } from '../Mi'
import type { VosConfig } from './storage'

export default function LockScreen({
  config,
  onUnlock,
}: {
  config: VosConfig
  onUnlock: () => void
}) {
  const [now, setNow] = useState(new Date())
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(false)
  const needsPassword = config.password.length > 0

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  function tryUnlock() {
    if (!needsPassword) {
      onUnlock()
      return
    }
    if (password === config.password) {
      onUnlock()
    } else {
      setErr(true)
      setPassword('')
      setTimeout(() => setErr(false), 800)
    }
  }

  const time = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className={`vos-lock ${err ? 'shake' : ''}`} onClick={() => !needsPassword && onUnlock()}>
      <div className="vos-lock-time">{time}</div>
      <div className="vos-lock-date">{date}</div>
      <div className="vos-lock-user">
        <div className="vos-lock-avatar">{(config.userName[0] || 'K').toUpperCase()}</div>
        <span>{config.userName}</span>
      </div>

      {needsPassword ? (
        <div className="vos-lock-form" onClick={(e) => e.stopPropagation()}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
            autoFocus
          />
          <button className="vos-lock-btn" onClick={tryUnlock} title="Sblocca">
            <Mi n="arrow_forward" />
          </button>
        </div>
      ) : (
        <p className="vos-lock-hint">Clicca ovunque per sbloccare</p>
      )}
    </div>
  )
}
