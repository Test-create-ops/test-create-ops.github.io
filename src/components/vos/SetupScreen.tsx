import { useState } from 'react'
import { Mi } from '../Mi'
import type { VosConfig } from './storage'

export default function SetupScreen({
  onComplete,
}: {
  onComplete: (config: VosConfig) => void
}) {
  const [step, setStep] = useState(0)
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [usePassword, setUsePassword] = useState(true)
  const [err, setErr] = useState('')

  function finish() {
    if (!userName.trim()) {
      setErr('Inserisci un nome utente.')
      return
    }
    if (usePassword) {
      if (password.length < 4) {
        setErr('La password deve avere almeno 4 caratteri.')
        return
      }
      if (password !== confirm) {
        setErr('Le password non coincidono.')
        return
      }
    }
    onComplete({
      setupComplete: true,
      userName: userName.trim(),
      password: usePassword ? password : '',
      wallpaper: 'gradient',
    })
  }

  return (
    <div className="vos-setup">
      <div className="vos-setup-card">
        <div className="vos-setup-head">
          <Mi n="settings_suggest" />
          <h2>Configurazione VOS</h2>
          <p>Passo {step + 1} di 3</p>
        </div>

        {step === 0 && (
          <div className="vos-setup-body">
            <label>Nome utente</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Es. Francesco"
              autoFocus
            />
            <p className="vos-setup-hint">Questo nome apparirà sul desktop e sul lock screen.</p>
            <button className="btn" onClick={() => userName.trim() ? setStep(1) : setErr('Inserisci un nome.')}>
              <Mi n="arrow_forward" /> Avanti
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="vos-setup-body">
            <label>Sicurezza</label>
            <button
              type="button"
              className={`vos-setup-toggle ${usePassword ? 'on' : ''}`}
              onClick={() => setUsePassword(true)}
            >
              <Mi n="lock" /> Usa password al lock screen
            </button>
            <button
              type="button"
              className={`vos-setup-toggle ${!usePassword ? 'on' : ''}`}
              onClick={() => setUsePassword(false)}
            >
              <Mi n="lock_open" /> Nessuna password
            </button>
            {usePassword && (
              <>
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <label>Conferma password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </>
            )}
            <div className="vos-setup-actions">
              <button className="btn ghost" onClick={() => setStep(0)}><Mi n="arrow_back" /> Indietro</button>
              <button className="btn" onClick={() => setStep(2)}><Mi n="arrow_forward" /> Avanti</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="vos-setup-body">
            <div className="vos-setup-summary">
              <div><Mi n="person" /> <b>{userName || '—'}</b></div>
              <div><Mi n={usePassword ? 'lock' : 'lock_open'} /> {usePassword ? 'Password attiva' : 'Senza password'}</div>
              <div><Mi n="desktop_windows" /> 17 app installate</div>
            </div>
            <button className="btn big" onClick={finish}>
              <Mi n="check_circle" /> Avvia VOS
            </button>
            <button className="btn ghost" onClick={() => setStep(1)}><Mi n="arrow_back" /> Indietro</button>
          </div>
        )}

        {err && <p className="errbar">{err}</p>}
      </div>
    </div>
  )
}
