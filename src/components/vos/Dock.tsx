import { useState } from 'react'
import { Mi } from '../Mi'
import { VOS_APPS } from './apps/registry'
import { loadSacApps } from './storage'

export default function Dock({
  openApps,
  activeId,
  onLaunch,
}: {
  openApps: string[]
  activeId: string | null
  onLaunch: (id: string) => void
}) {
  const [hover, setHover] = useState<string | null>(null)
  const sacApps = loadSacApps()

  return (
    <div className="vos-dock-wrap">
      <div className="vos-dock">
        {VOS_APPS.filter((a) => a.dock).map((app) => {
          const isOpen = openApps.includes(app.id)
          const isHover = hover === app.id
          return (
            <button
              key={app.id}
              className={`vos-dock-item ${isOpen ? 'open' : ''} ${activeId === app.id ? 'active' : ''} ${isHover ? 'hover' : ''}`}
              onMouseEnter={() => setHover(app.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onLaunch(app.id)}
              title={app.name}
            >
              {isHover && <span className="vos-dock-label">{app.name}</span>}
              <span className="vos-dock-icon">
                <Mi n={app.icon} />
              </span>
              {isOpen && <span className="vos-dock-dot" />}
            </button>
          )
        })}
        <span className="vos-dock-sep" />
        {/* App installate con SAC */}
        {sacApps.map((a) => {
          const id = `sac:${a.pkg}`
          const isOpen = openApps.includes(id)
          const isHover = hover === id
          return (
            <button
              key={id}
              className={`vos-dock-item ${isOpen ? 'open' : ''} ${activeId === id ? 'active' : ''} ${isHover ? 'hover' : ''}`}
              onMouseEnter={() => setHover(id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onLaunch(id)}
              title={`${a.name} (SAC)`}
            >
              {isHover && (
                <span className="vos-dock-label">{a.name} · template SAC</span>
              )}
              <span className="vos-dock-icon sac">
                {a.icon ? <img src={a.icon} alt="" /> : <Mi n="android" />}
              </span>
              {isOpen && <span className="vos-dock-dot" />}
            </button>
          )
        })}
        {sacApps.length > 0 && (
          <button
            className={`vos-dock-item ${openApps.includes('sac-installed') ? 'open' : ''} ${activeId === 'sac-installed' ? 'active' : ''} ${hover === 'sac-mine' ? 'hover' : ''}`}
            onMouseEnter={() => setHover('sac-mine')}
            onMouseLeave={() => setHover(null)}
            onClick={() => onLaunch('sac-installed')}
            title="Le mie app SAC"
          >
            {hover === 'sac-mine' && <span className="vos-dock-label">Le mie app SAC</span>}
            <span className="vos-dock-icon sac sac-folder">
              <Mi n="apps" />
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
