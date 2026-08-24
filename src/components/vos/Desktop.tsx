import { useCallback, useState } from 'react'
import Dock from './Dock'
import VosWindow, { type VosWindowState } from './VosWindow'
import { getApp } from './apps/registry'
import { renderVosApp } from './apps/render'
import type { VosConfig, SacAppData } from './storage'
import { loadSacApps } from './storage'
import { Mi } from '../Mi'

let winSeq = 1

const DEFAULTS: Record<string, { w: number; h: number }> = {
  vps: { w: 920, h: 560 },
  fpixel: { w: 780, h: 520 },
  terminal: { w: 640, h: 400 },
  navigator: { w: 900, h: 560 },
  paint: { w: 720, h: 480 },
}

export default function Desktop({
  config,
  onLock,
  onExit,
}: {
  config: VosConfig
  onLock: () => void
  onExit: () => void
}) {
  const [windows, setWindows] = useState<VosWindowState[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [zTop, setZTop] = useState(10)

  const openApps = windows.filter((w) => !w.minimized).map((w) => w.appId)

  const launch = useCallback(
    (appId: string) => {
      const existing = windows.find((w) => w.appId === appId && !w.minimized)
      if (existing) {
        setActiveId(existing.id)
        setWindows((ws) => ws.map((w) => (w.id === existing.id ? { ...w, z: zTop + 1 } : w)))
        setZTop((z) => z + 1)
        return
      }
      // Le app SAC non sono nel registry statico: ricaviamo il titolo dallo storage
      let title = getApp(appId)?.name
      if (!title && appId.startsWith('sac:')) {
        const pkg = appId.slice(4)
        const sacApp = loadSacApps().find((a) => a.pkg === pkg)
        if (!sacApp) return
        title = sacApp.name
      } else if (!title && appId === 'sac-installed') {
        title = 'Le mie app SAC'
      }
      if (!title) return
      const size = DEFAULTS[appId] || { w: 520, h: 380 }
      const id = `win-${winSeq++}`
      const offset = (windows.length % 6) * 28
      setWindows((ws) => [
        ...ws,
        {
          id,
          appId,
          title,
          x: 80 + offset,
          y: 48 + offset,
          w: size.w,
          h: size.h,
          z: zTop + 1,
          minimized: false,
        },
      ])
      setActiveId(id)
      setZTop((z) => z + 1)
    },
    [windows, zTop],
  )

  function closeWindow(id: string) {
    setWindows((ws) => ws.filter((w) => w.id !== id))
    if (activeId === id) setActiveId(null)
  }

  function minimizeWindow(id: string) {
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
    if (activeId === id) setActiveId(null)
  }

  return (
    <div className="vos-desktop">
      <div className="vos-menubar">
        <button className="vos-menu-brand" onClick={onExit}>
          <Mi n="memory" /> KairoVOS
        </button>
        <span className="vos-menu-item">File</span>
        <span className="vos-menu-item">Modifica</span>
        <span className="vos-menu-item">Visualizza</span>
        <div className="vos-menu-spacer" />
        <button className="vos-menu-btn" onClick={onLock} title="Blocca">
          <Mi n="lock" />
        </button>
        <span className="vos-menu-user">{config.userName}</span>
      </div>

      <div className="vos-wallpaper" />

      {windows.map((win) => (
        <VosWindow
          key={win.id}
          win={win}
          active={activeId === win.id}
          onFocus={() => {
            setActiveId(win.id)
            setWindows((ws) => ws.map((w) => (w.id === win.id ? { ...w, z: zTop + 1 } : w)))
            setZTop((z) => z + 1)
          }}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
        >
          {renderVosApp(win.appId, config, launch)}
        </VosWindow>
      ))}

      <Dock openApps={openApps} activeId={windows.find((w) => w.id === activeId)?.appId ?? null} onLaunch={launch} />
    </div>
  )
}
