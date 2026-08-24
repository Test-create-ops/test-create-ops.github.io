import { useState } from 'react'
import { Mi } from '../Mi'
import { VOS_APPS } from './apps/registry'

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
      </div>
    </div>
  )
}
