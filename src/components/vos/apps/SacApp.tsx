import { Mi } from '../../Mi'
import { removeSacApp, type SacAppData } from '../storage'

const TEMPLATES = ['Puzzle', 'Notes', 'Utility', 'Snake', 'Clock'] as const

export default function SacApp({ app }: { app: SacAppData }) {
  function uninstall() {
    removeSacApp(app.pkg)
    location.reload()
  }

  return (
    <div className="sac">
      <div className="sac-banner">
        <Mi n="info" />
        <span>
          <b>Template SAC</b> · Questa è una versione VOS basata su template, costruita con i dati
          reali estratti dall'APK. Quando la tecnologia <b>APK Reader</b> arriverà, potresti vedere
          eventuali cambiamenti alle app.
        </span>
      </div>

      <div className="sac-card">
        {app.icon ? (
          <img className="sac-icon" src={app.icon} alt="" />
        ) : (
          <span className="sac-icon sac-icon-fb">
            <Mi n="android" />
          </span>
        )}
        <div className="sac-meta">
          <b>{app.name}</b>
          <small>{app.pkg}</small>
          <span>v{app.version || '—'} · convertito da SAC</span>
        </div>
        <button className="sac-del" onClick={uninstall} title="Disinstalla">
          <Mi n="delete" />
        </button>
      </div>

      {app.permissions.length > 0 && (
        <div className="sac-perms">
          <b>Permessi letti dall'APK</b>
          <div className="sac-perm-list">
            {app.permissions.map((p) => (
              <code key={p}>{p}</code>
            ))}
          </div>
        </div>
      )}

      <div className="sac-templates">
        <b>Esegui con un template</b>
        <div className="sac-tpl-grid">
          {TEMPLATES.map((t) => (
            <button key={t} className="sac-tpl" disabled title="In arrivo">
              <Mi n="widgets" />
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
