import { useCallback, useState } from 'react'
import Dock from './Dock'
import VosWindow, { type VosWindowState } from './VosWindow'
import { getApp } from './apps/registry'
import { renderVosApp } from './apps/render'
import type { VosConfig, SacAppData, DeskItem } from './storage'
import { loadSacApps, loadDeskItems, saveDeskItems } from './storage'
import ContextMenu, { type CtxItem } from './ContextMenu'
import { Mi } from '../Mi'

let winSeq = 1

const DEFAULTS: Record<string, { w: number; h: number }> = {
  vps: { w: 920, h: 560 },
  fpixel: { w: 780, h: 520 },
  terminal: { w: 640, h: 400 },
  navigator: { w: 900, h: 560 },
  paint: { w: 720, h: 480 },
  emoji: { w: 560, h: 440 },
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
  const [deskItems, setDeskItems] = useState<DeskItem[]>(() => loadDeskItems())

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
      } else if (!title && (appId.startsWith('text:') || appId.startsWith('folder:'))) {
        const id = appId.slice(appId.indexOf(':') + 1)
        const item = loadDeskItems().find((i) => i.id === id)
        if (!item) return
        title = item.name
      } else if (!title && appId === 'sac-installed') {
        title = 'Le mie app SAC'
      }
      if (!title) return
      const size =
        DEFAULTS[appId] ||
        (appId.startsWith('text:')
          ? { w: 480, h: 380 }
          : { w: 520, h: 380 })
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

  /* ── Menu contestuale (tasto destro) ── */
  const [ctx, setCtx] = useState<{ x: number; y: number; items: CtxItem[] } | null>(null)

  function desktopCtx(e: React.MouseEvent) {
    e.preventDefault()
    setCtx({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: 'Emoji', icon: 'mood', action: () => launch('emoji') },
        {
          label: 'Nuova',
          icon: 'add',
          sub: [
            {
              label: 'Cartella',
              icon: 'create_new_folder',
              action: () => addDeskItem('folder'),
            },
            {
              label: 'Documento di testo',
              icon: 'note_add',
              action: () => addDeskItem('text'),
            },
          ],
        },
        { sep: true },
        { label: 'Aggiorna', icon: 'refresh', action: () => setDeskItems(loadDeskItems()) },
      ],
    })
  }

  function itemCtx(e: React.MouseEvent, item: DeskItem) {
    e.preventDefault()
    e.stopPropagation()
    setCtx({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: 'Apri',
          icon: 'open_in_new',
          action: () => launch(`${item.type}:${item.id}`),
        },
        {
          label: 'Rinomina',
          icon: 'edit',
          action: () => renameDeskItem(item.id),
        },
        { sep: true },
        {
          label: 'Elimina',
          icon: 'delete',
          action: () => {
            saveDeskItems(loadDeskItems().filter((i) => i.id !== item.id))
            setDeskItems(loadDeskItems())
          },
        },
      ],
    })
  }

  function uniqueName(base: string): string {
    const names = new Set(deskItems.map((i) => i.name))
    if (!names.has(base)) return base
    let n = 2
    while (names.has(`${base} ${n}`)) n++
    return `${base} ${n}`
  }

  function addDeskItem(type: 'folder' | 'text') {
    const name = type === 'folder' ? 'Nuova cartella' : 'Nuovo documento.txt'
    const items = loadDeskItems()
    const item: DeskItem = {
      id: `it-${Date.now()}`,
      type,
      name: uniqueName(name),
      content: '',
    }
    saveDeskItems([...items, item])
    setDeskItems([...items, item])
  }

  function renameDeskItem(id: string) {
    const item = deskItems.find((i) => i.id === id)
    if (!item) return
    const name = window.prompt('Nuovo nome:', item.name)
    if (!name?.trim()) return
    const items = loadDeskItems().map((i) => (i.id === id ? { ...i, name: name.trim() } : i))
    saveDeskItems(items)
    setDeskItems(items)
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

      {/* Desktop: tasto destro qui */}
      <div className="vos-wallpaper" onContextMenu={desktopCtx} onClick={() => setCtx(null)} />

      {/* Icone create dal menu "Nuova" */}
      <div className="vos-desk-icons">
        {deskItems.map((item) => (
          <div
            key={item.id}
            className={`vos-desk-icon ${item.type}`}
            title={item.name}
            onContextMenu={(e) => itemCtx(e, item)}
            onDoubleClick={() => launch(`${item.type}:${item.id}`)}
          >
            <Mi n={item.type === 'folder' ? 'folder' : 'description'} />
            <span>{item.name}</span>
          </div>
        ))}
      </div>

      {ctx && <ContextMenu x={ctx.x} y={ctx.y} items={ctx.items} onClose={() => setCtx(null)} />}

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
