import { Mi } from '../components/Mi'

const FEATURES = [
  { icon: 'draw', title: 'Canvas', desc: 'Disegna pixel, forme e testo su un software renderer scritto da zero.' },
  { icon: 'image', title: '68 icone', desc: 'Icone built-in pronte all\'uso, a più colori, incluse nell\'SDK.' },
  { icon: 'volume_up', title: '66 suoni', desc: 'Effetti sintetizzati al volo: click, notifiche, esplosioni.' },
  { icon: 'music_note', title: '10 tracce', desc: 'Musica di gioco generata proceduralmente, zero asset esterni.' },
  { icon: 'widgets', title: '30+ widget', desc: 'Pulsanti, slider, barre di progresso e menu già pronti.' },
  { icon: 'dark_mode', title: 'Temi', desc: 'Scuro, chiaro o custom: un API per colori coerenti in tutta l\'app.' },
]

export function SdkPage({ setPage }: { setPage: (p: 'dev') => void }) {
  return (
    <main className="wrap">
      <div className="hero">
        <span className="badge">
          <span className="dot-live" />
          KairoSDK v0.1.0 — solo developer certificati
        </span>
        <h1>
          Crea app per <b>KairoOS</b> in C++, in pochi minuti.
        </h1>
        <p>
          Una libreria facile e divertente per disegnare, suonare e costruire interfacce.
          Con il wrapper <code style={{ color: 'var(--accent)', fontFamily: "'JetBrains Mono',monospace" }}>namespace kec</code>{' '}
          (Kairo Easy Coding) inizi subito. L'SDK non è pubblico: lo ricevi via email dopo la certificazione.
        </p>
        <div style={{ marginTop: 26 }}>
          <button className="btn big" onClick={() => setPage('dev')}>
            <Mi n="lock" />
            Ricevi l'SDK con la certificazione
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <h2 className="section-title"><Mi n="auto_awesome" />Tutto incluso</h2>
      <div className="bento">
        {FEATURES.map((f) => (
          <div key={f.title} className="cell">
            <Mi n={f.icon} />
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Codice */}
      <div className="card">
        <h2><Mi n="terminal" />Il tuo primo programma</h2>
        <div className="code-window">
          <div className="os-titlebar">
            <span className="tl tl-r" /><span className="tl tl-y" /><span className="tl tl-g" />
            <span>main.cpp — KairoCode IDE</span>
          </div>
          <pre>
            <code>
              <span className="kw">#include</span> <span className="str">"KairoECC.h"</span>{'\n\n'}
              <span className="kw">int</span> <span className="ns">main</span>() {'{'}{'\n'}
              {'    '}kec::Canvas c(<span className="lit">320</span>, <span className="lit">240</span>);{'\n'}
              {'    '}c.clear(kec::White);{'\n'}
              {'    '}c.icon(<span className="str">"heart"</span>, <span className="lit">100</span>, <span className="lit">100</span>, <span className="lit">32</span>, kec::Red);{'\n'}
              {'    '}c.save(<span className="str">"cuore.bmp"</span>);{'\n'}
              {'    '}<span className="kw">return</span> <span className="lit">0</span>;{'\n'}
              {'}'}
            </code>
          </pre>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
          Compila con un semplice <b style={{ color: 'var(--text)' }}>make</b>: l'SDK è una{' '}
          <b style={{ color: 'var(--text)' }}>dylib</b> per macOS (Apple Silicon) in{' '}
          <b style={{ color: 'var(--text)' }}>C++17</b>, con anche la <b style={{ color: 'var(--text)' }}>C API</b>{' '}
          completa (<code style={{ color: 'var(--accent)' }}>KairoSDK.h</code>). Tutto gira sul{' '}
          <b style={{ color: 'var(--text)' }}>software renderer</b>: nessuna dipendenza esterna.
        </p>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2><Mi n="verified_user" />Come si riceve l'SDK</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 2, marginBottom: 18, fontSize: 14 }}>
          1. Accedi con Google nella pagina <b style={{ color: 'var(--text)' }}>Developers</b>.<br />
          2. Richiedi la <b style={{ color: 'var(--text)' }}>certificazione</b>: ricevi il{' '}
          <b style={{ color: 'var(--text)' }}>codice</b> via email e scarichi il <b style={{ color: 'var(--text)' }}>certificato</b>.<br />
          3. Carica il certificato e inserisci il codice per attivarla.<br />
          4. Attivata: scarichi l'<b style={{ color: 'var(--text)' }}>SDK</b> direttamente dal tuo account.
        </p>
        <button className="btn" onClick={() => setPage('dev')}>
          <Mi n="person" />
          Vai a Developers
        </button>
      </div>
    </main>
  )
}
