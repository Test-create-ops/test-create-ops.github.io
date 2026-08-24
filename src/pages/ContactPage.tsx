import { useState } from 'react'
import { Mi } from '../components/Mi'
import { useToast } from '../components/Toast'
import { EDGE } from '../lib/supabase'

export default function ContactPage() {
  const { toast } = useToast()
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name: '', mail: '', subject: '', message: '', hp: '' })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.mail || !form.message) { toast('Compila tutti i campi.'); return }
    setSending(true)
    try {
      const r = await fetch(EDGE, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ type: 'contact', ...form }),
      })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d.ok) {
        toast('Inviato a Kairo Support! Ti rispondiamo presto.')
        setForm({ name: '', mail: '', subject: '', message: '', hp: '' })
      } else {
        toast('Errore: ' + (d.error || 'riprova tra poco'))
      }
    } catch (ex) {
      toast('Errore: ' + (ex instanceof Error ? ex.message : String(ex)))
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="wrap">
      <div className="hero">
        <span className="badge"><Mi n="support_agent" />Kairo Support</span>
        <h1>Contattaci — <b>Kairo Support</b></h1>
        <p>
          Domande su KairoOS, su Kairo Store o sull'SDK? Compila il modulo qui sotto:
          l'email arriva direttamente al supporto, senza passare dal tuo client di posta.
        </p>
      </div>

      <div className="grid">
        <div className="feature"><Mi n="mail" /><h3>Email</h3><p><a href="mailto:teodorgrigore15@gmail.com">teodorgrigore15@gmail.com</a></p></div>
        <div className="feature"><Mi n="code" /><h3>GitHub</h3><p><a href="https://github.com/Test-create-ops/KairoOS-BETA" target="_blank" rel="noopener">KairoOS-BETA</a></p></div>
        <div className="feature"><Mi n="forum" /><h3>Discord</h3><p style={{ color: 'var(--faint)' }}>in arrivo</p></div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <h2><Mi n="mail" />Kairo Support</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.8, marginBottom: 6 }}>
          Premi <b style={{ color: 'var(--text)' }}>Invia</b>: il messaggio parte subito verso{' '}
          <b style={{ color: 'var(--text)' }}>teodorgrigore15@gmail.com</b>. Rispondiamo entro qualche giorno lavorativo.
        </p>
        <form onSubmit={onSubmit}>
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden value={form.hp}
            onChange={(e) => setForm({ ...form, hp: e.target.value })}
            style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
          <label>Il tuo nome</label>
          <input type="text" placeholder="es. Kairo Kid" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label>La tua email (per la risposta)</label>
          <input type="email" placeholder="es. tu@email.com" required value={form.mail}
            onChange={(e) => setForm({ ...form, mail: e.target.value })} />
          <label>Oggetto</label>
          <input type="text" placeholder="es. Domanda su KairoOS" required value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <label>Messaggio</label>
          <textarea rows={6} placeholder="Scrivi qui il tuo messaggio..." required value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 11, border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
            }} />
          <div style={{ marginTop: 20 }}>
            <button className="btn big" type="submit" disabled={sending}>
              <Mi n="send" />{sending ? 'Invio...' : 'Invia a Kairo Support'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
