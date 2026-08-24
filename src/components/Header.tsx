import { Mi } from './Mi'
import { useAuth } from '../lib/auth'

export type Page = 'store' | 'sdk' | 'dev' | 'contact' | 'about' | 'vos'

const NAV: { id: Page; icon: string; label: string }[] = [
  { id: 'store', icon: 'apps', label: 'Store' },
  { id: 'sdk', icon: 'code', label: 'SDK' },
  { id: 'vos', icon: 'desktop_windows', label: 'VOS' },
  { id: 'dev', icon: 'person', label: 'Developers' },
  { id: 'contact', icon: 'mail', label: 'Contatti' },
  { id: 'about', icon: 'person', label: 'About Me' },
]

export default function Header({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const { user, profile, logout } = useAuth()

  if (!user) {
    return (
      <header>
        <div className="navbar">
          <div className="brand">
            <img src="/icons/kairo_logo.png" alt="Kairo" />
            Kairo<b>Store</b>
          </div>
          <nav className="nav">
            {NAV.map((n) => (
              <button key={n.id} className={page === n.id ? 'on' : ''} onClick={() => setPage(n.id)}>
                <Mi n={n.icon} />
                {n.label}
              </button>
            ))}
          </nav>
          <div className="spacer" />
        </div>
      </header>
    )
  }

  const name = profile?.username || user.username || user.email
  return (
    <header>
      <div className="navbar">
        <div className="brand">
          <img src="/icons/kairo_logo.png" alt="Kairo" />
          Kairo<b>Store</b>
        </div>
        <nav className="nav">
          {NAV.map((n) => (
            <button key={n.id} className={page === n.id ? 'on' : ''} onClick={() => setPage(n.id)}>
              <Mi n={n.icon} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="spacer" />
        <div className="userchip">
          {profile?.avatar_url || user.avatar ? (
            <img className="avatar-sm" src={profile?.avatar_url || user.avatar} alt="" referrerPolicy="no-referrer" />
          ) : (
            <div className="avatar-fb">{(name[0] || 'K').toUpperCase()}</div>
          )}
          <span>{name}</span>
        </div>
        <button className="iconbtn" onClick={logout} title="Esci">
          <Mi n="logout" />
        </button>
      </div>
    </header>
  )
}
