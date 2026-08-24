import { ReactNode } from 'react'
import { Mi } from '../Mi'

export interface VosWindowState {
  id: string
  appId: string
  title: string
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
}

export default function VosWindow({
  win,
  active,
  onFocus,
  onClose,
  onMinimize,
  children,
}: {
  win: VosWindowState
  active: boolean
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  children: ReactNode
}) {
  if (win.minimized) return null

  return (
    <div
      className={`vos-window ${active ? 'active' : ''}`}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onMouseDown={onFocus}
    >
      <div className="vos-window-title">
        <div className="vos-window-controls">
          <button className="vos-wc close" onClick={onClose} aria-label="Chiudi" />
          <button className="vos-wc min" onClick={onMinimize} aria-label="Minimizza" />
          <button className="vos-wc max" aria-label="Massimizza" />
        </div>
        <span>{win.title}</span>
        <Mi n="drag_indicator" className="vos-window-drag" />
      </div>
      <div className="vos-window-body">{children}</div>
    </div>
  )
}
