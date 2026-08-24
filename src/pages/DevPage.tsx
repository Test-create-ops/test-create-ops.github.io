import { useEffect, useState } from 'react'
import { SignInButton } from '@clerk/clerk-react'
import { Mi } from '../components/Mi'
import { useAuth } from '../lib/auth'
import { useToast } from '../components/Toast'
import { sendMail } from '../lib/supabase'
import Portal from './Portal'

type DevState = 'loading' | 'home' | 'cert' | 'activate' | 'sdk' | 'portal'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.4 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.8c4.4-4.1 7.2-10.1 7.2-17.5z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.1 0 11.2-2 15-5.5l-7.4-5.8c-2 1.4-4.6 2.3-7.6 2.3-6.3 0-11.7-3.9-13.6-9.3l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

export default function DevPage() {
  const {
    user, profile, ready, signInWithGoogle, getToken,
    refreshProfile, requestCert, downloadCert, verifyCert, activateCert,
  } = useAuth()
  const { toast } = useToast()
  const [state, setState] = useState<DevState>('loading')
  const [devErr, setDevErr] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [certOk, setCertOk] = useState(false)
  const [certErr, setCertErr] = useState('')
  const [codeErr, setCodeErr] = useState('')

  useEffect(() => {
    if (!ready) return
    if (!user) {
      setState('home')
      return
    }
    refreshProfile()
      .then((p) => {
        if (p?.certified) setState('sdk')
        else if (p?.cert_code) setState('activate')
        else if (p) setState('cert')
        else setState('home')
      })
      .catch((e) => {
        setDevErr(e.message || 'errore')
        setState('home')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user])

  async function onRequestCert() {
    const err = await requestCert()
    if (err) { toast('Errore: ' + err); return }
    const res = await sendMail((await getToken()) || undefined, profile?.username || '', 'cert', { code: profile?.cert_code })
    toast('Certificazione richiesta! Controlla la tua email.')
    if (res.error) setDevErr('EMAIL NON PARTITA: ' + res.error)
  }

  function onCertFile(f: File | undefined) {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      const res = verifyCert(String(reader.result))
      if (res.ok) { setCertErr(''); setCertOk(true) }
      else { setCertOk(false); setCertErr(res.why || 'errore') }
    }
    reader.readAsText(f)
  }

  async function onActivate() {
    const v = codeInput.trim().toUpperCase()
    if (!profile?.cert_code) { setCodeErr('Prima richiedi la certificazione.'); return }
    if (v === profile.cert_code.toUpperCase()) {
      const err = await activateCert()
      if (err) { setCodeErr(err); return }
      setCodeErr('')
      setState('sdk')
      const res = await sendMail((await getToken()) || undefined, profile.username, 'sdk')
      toast("Certificazione attivata! L'email con lo SDK è in arrivo.")
      if (res.error) setDevErr('EMAIL SDK NON PARTITA: ' + res.error)
    } else {
      setCodeErr('Codice errato. Rivedi il tuo codice.')
    }
  }

  if (state === 'loading') {
    return (
      <main className="wrap">
        <div className="empty"><Mi n="hourglass_top" /><b>Caricamento…</b></div>
      </main>
    )
  }

  if (state === 'portal' && user && profile?.certified) return <Portal />

  return (
    <main className="wrap">
      {devErr && (
        <div className="errbar" style={{ background: 'rgba(248,113,113,.1)', border: '1px solid var(--error)', padding: '14px 18px', borderRadius: 12, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
          {devErr}
        </div>
      )}

      {state === 'home' && (
        <>
          <div className="hero">
            <span className="badge"><Mi n="verified_user" />Developer Program</span>
            <h1>Porta le tue app su <b>KairoOS</b>.</h1>
            <p>Un account, quattro passi: accedi, certifichi ti, attivi, pubblichi. Tutto parte da qui.</p>
          </div>
          <div className="login-card">
            <h2 style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Mi n="login" />
              Accedi al Developer Program
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, textAlign: 'center', marginBottom: 24 }}>
              Usa il tuo account Google. Nessuna password da ricordare.
            </p>
            <SignInButton mode="modal" oauthFlow="popup">
              <button className="btn google big" style={{ width: '100%', justifyContent: 'center' }}>
                <GoogleIcon />
                Continua con Google
              </button>
            </SignInButton>
            <p style={{ color: 'var(--faint)', fontSize: 12, textAlign: 'center', marginTop: 20, lineHeight: 1.7 }}>
              Registrandoti accetti di usare il tuo account Google solo per l'accesso al Developer Program.
            </p>
          </div>
          <div className="stats-row" style={{ justifyContent: 'center' }}>
            <div className="stat-chip"><b>1</b><span>Accedi</span></div>
            <div className="stat-chip"><b>2</b><span>Certifichi</span></div>
            <div className="stat-chip"><b>3</b><span>Attivi</span></div>
            <div className="stat-chip"><b>4</b><span>Pubblichi</span></div>
          </div>
        </>
      )}

      {state === 'cert' && (
        <>
          <div className="steps">
            <div className="step done"><div className="num">1</div>Account attivo</div>
            <div className="step active"><div className="num">2</div>Richiedi certificazione</div>
            <div className="step"><div className="num">3</div>Attiva con il codice</div>
            <div className="step"><div className="num">4</div>SDK ricevuto!</div>
          </div>
          <div className="card">
            <h2><Mi n="verified_user" />Certificazione developer</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
              La certificazione dimostra che sei un vero developer Kairo.
              Richiedendola ricevi un <b style={{ color: 'var(--text)' }}>codice personale via email</b> (salvato nel tuo account)
              e il <b style={{ color: 'var(--text)' }}>certificato</b> da scaricare.
            </p>
            <div style={{ marginTop: 20 }}>
              <button className="btn big" onClick={onRequestCert}><Mi n="verified_user" />Richiedi la certificazione</button>
            </div>
            {profile?.cert_code && (
              <div style={{ marginTop: 22 }}>
                <div className="okbar">
                  <Mi n="check_circle" />
                  Certificazione richiesta per <b style={{ marginLeft: 4 }}>{profile.username}</b>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>
                  Controlla la tua email: il tuo codice personale è in arrivo da "Kairo Store". Il certificato lo scarichi qui:
                </p>
                <button className="btn ghost" onClick={downloadCert}><Mi n="download" />Scarica il certificato</button>
                <div style={{ marginTop: 18 }}>
                  <button className="btn" onClick={() => setState('activate')}><Mi n="settings" />Vai ad attivarla</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {state === 'activate' && (
        <>
          <div className="steps">
            <div className="step done"><div className="num">1</div>Account attivo</div>
            <div className="step done"><div className="num">2</div>Certificazione richiesta</div>
            <div className="step active"><div className="num">3</div>Attiva con il codice</div>
            <div className="step"><div className="num">4</div>SDK ricevuto!</div>
          </div>
          <div className="card" style={{ maxWidth: 600 }}>
            <h2><Mi n="settings" />Attiva la certificazione</h2>
            <label>Certificato (il file che hai scaricato)</label>
            <input type="file" accept=".cert,.crt,.pem,.txt" style={{ display: 'none' }} id="certFile"
              onChange={(e) => onCertFile(e.target.files?.[0])} />
            <div className="filebox" onClick={() => document.getElementById('certFile')?.click()}>
              <Mi n="upload" />
              <div><b>Carica il certificato</b><br /><span style={{ fontSize: 12.5 }}>il tuo kairo-certificate-*.cert</span></div>
            </div>
            {certOk && <div className="certok"><Mi n="check_circle" />Certificato verificato. Ora inserisci il codice.</div>}
            {certErr && <div className="errbar">{certErr}</div>}
            <label>Codice di certificazione (nella email che hai ricevuto)</label>
            <div style={{ display: 'flex', gap: 9 }}>
              <input type="text" placeholder="es. A1B2C3" autoComplete="off" value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)} />
              <button className="btn" onClick={onActivate}><Mi n="verified_user" />Attiva</button>
            </div>
            {codeErr && <div className="errbar">{codeErr}</div>}
          </div>
        </>
      )}

      {state === 'sdk' && profile && (
        <>
          <div className="steps">
            <div className="step done"><div className="num">1</div>Account attivo</div>
            <div className="step done"><div className="num">2</div>Certificazione richiesta</div>
            <div className="step done"><div className="num">3</div>Attivata con il codice</div>
            <div className="step done active"><div className="num">4</div>SDK ricevuto!</div>
          </div>
          <div className="okbar">
            <Mi n="check_circle" />
            Certificazione attivata! Benvenuto nel Developer Program, <b style={{ marginLeft: 4 }}>{profile.username}</b>.
          </div>
          <div className="card" style={{ margin: '18px 0' }}>
            <h2><Mi n="download" />Il tuo KairoSDK v0.1.0</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>Namespace <b style={{ color: 'var(--text)' }}>kec</b>, Canvas, 68 icone, 66 suoni, 10 tracce, 30+ widget.</p>
            <div className="attach">
              <div className="afile"><Mi n="download" /></div>
              <div style={{ flex: 1 }}>
                <b>KairoSDK-v0.1.0.zip</b><br />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>12 MB · framework + esempi + README</span>
              </div>
              <a className="btn" href="/KairoSDK-v0.1.0.zip" download><Mi n="download" />Scarica</a>
            </div>
          </div>
          <div className="card" style={{ margin: '18px 0', borderColor: 'var(--accent-border)' }}>
            <h2><Mi n="code" />KairoCode — l'IDE di Kairo</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>L'IDE che scarica e installa il KairoSDK da solo, crea il progetto, compila, esegue e prepara la pubblicazione.</p>
            <div className="attach">
              <div className="afile"><Mi n="download" /></div>
              <div style={{ flex: 1 }}>
                <b>KairoCode-v1.0.0.zip</b><br />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>1 MB · app macOS</span>
              </div>
              <a className="btn" href="/KairoCode-v1.0.0.zip" download><Mi n="download" />Scarica</a>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.8, marginTop: 10 }}>
              Prima apertura su macOS: tasto destro sull'app → <b style={{ color: 'var(--text)' }}>Apri</b> →{' '}
              <b style={{ color: 'var(--text)' }}>Apri comunque</b> (oppure:{' '}
              <span style={{ fontFamily: 'monospace', background: 'var(--surface)', padding: '1px 6px', borderRadius: 5 }}>
                xattr -dr com.apple.quarantine ~/Downloads/KairoCode.app
              </span>).
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn big" onClick={() => setState('portal')}><Mi n="power_settings_new" />Apri il Developer Portal</button>
          </div>
        </>
      )}
    </main>
  )
}
