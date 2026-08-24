import { useState } from 'react'
import { Mi } from '../../Mi'
import { removeSacApp, type SacAppData } from '../storage'
import { TplPuzzle, TplSnake, TplNotes, TplClock, TplUtility } from './sacTemplates'

const TEMPLATES = [
  { id: 'puzzle', label: 'Puzzle 2048', comp: TplPuzzle },
  { id: 'snake', label: 'Snake', comp: TplSnake },
  { id: 'notes', label: 'Notes', comp: TplNotes },
  { id: 'clock', label: 'Orologio', comp: TplClock },
  { id: 'utility', label: 'Utilità', comp: TplUtility },
] as const

type TplId = (typeof TEMPLATES)[number]['id']

function tplKey(pkg: string): string {
  return `sac-tpl-${pkg}`
}

export default function SacApp({ app }: { app: SacAppData }) {
  const [tpl, setTpl] = useState<TplId | null>(() => {
    const saved = localStorage.getItem(tplKey(app.pkg))
    return TEMPLATES.some((t) => t.id === saved) ? (saved as TplId) : null
  })
  const [changing, setChanging] = useState(false)

  function uninstall() {
    removeSacApp(app.pkg)
    localStorage.removeItem(tplKey(app.pkg))
    location.reload()
  }

  const active = TEMPLATES.find((t) => t.id === tpl)
  const ActiveComp = active?.comp

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
          <span>v{app.version || '—'} · template: {active ? active.label : 'nessuno'}</span>
        </div>
        <button className="sac-del" onClick={uninstall} title="Disinstalla">
          <Mi n="delete" />
        </button>
      </div>

      {ActiveComp && !changing && (
        <div className="sac-run">
          <div className="sac-run-head">
            <b><Mi n="play_arrow" /> In esecuzione: {active!.label}</b>
            <button className="tpl-btn" onClick={() => setChanging(true)}>Cambia template</button>
          </div>
          <ActiveComp app={app} />
        </div>
      )}

      {(!ActiveComp || changing) && (
        <div className="sac-templates">
          <b>Scegli come far girare questa app</b>
          <div className="sac-tpl-grid">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                className={`sac-tpl live ${tpl === t.id && !changing ? 'sel' : ''}`}
                onClick={() => {
                  setTpl(t.id)
                  localStorage.setItem(tplKey(app.pkg), t.id)
                  setChanging(false)
                }}
              >
                <Mi n="widgets" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {app.permissions.length > 0 && (
        <details className="sac-perms-details">
          <summary>Permessi letti dall'APK ({app.permissions.length})</summary>
          <div className="sac-perm-list">
            {app.permissions.map((p) => (
              <code key={p}>{p}</code>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
