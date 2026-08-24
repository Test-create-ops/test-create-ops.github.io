import { useEffect, useState } from 'react'
import Header, { type Page } from './components/Header'
import { AuthProvider, useAuth } from './lib/auth'
import { ToastProvider } from './components/Toast'
import { StorePage } from './pages/StorePage'
import { SdkPage } from './pages/SdkPage'
import DevPage from './pages/DevPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  const [page, setPage] = useState<Page>('store')

  return (
    <AuthProvider>
      <AuthRedirect page={page} setPage={setPage} />
      <ToastProvider>
        {/* Sfondo aurora animato */}
        <div className="aurora">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="grid-lines" />
        </div>

        <Header page={page} setPage={setPage} />
        {page === 'store' && <StorePage setPage={setPage} />}
        {page === 'sdk' && <SdkPage setPage={setPage} />}
        {page === 'dev' && <DevPage />}
        {page === 'contact' && <ContactPage />}
        {page === 'about' && <AboutPage />}

        <footer>
          <div className="foot-brand">
            <img src="/icons/kairo_logo.png" alt="Kairo" />
            Kairo<b style={{ color: 'var(--accent)' }}>Dev</b>
          </div>
          <p>© {new Date().getFullYear()} kairodev.it · Costruito con passione, un pezzetto alla volta.</p>
        </footer>
      </ToastProvider>
    </AuthProvider>
  )
}

/* Dopo il login con Google porta l'utente direttamente sul flusso developer */
function AuthRedirect({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const { ready, user } = useAuth()
  useEffect(() => {
    if (ready && user && page !== 'dev') setPage('dev')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user])
  return null
}
