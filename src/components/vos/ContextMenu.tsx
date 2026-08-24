import { useEffect, useRef, useState } from 'react'
import { Mi } from '../Mi'

export interface CtxItem {
  label?: string
  icon?: string
  sub?: CtxItem[]
  action?: () => void
  sep?: boolean
}

export default function ContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number
  y: number
  items: CtxItem[]
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [openSub, setOpenSub] = useState<number | null>(null)
  const [pos, setPos] = useState({ left: x, top: y })

  useEffect(() => {
    const el = ref.current
    if (el) {
      const r = el.getBoundingClientRect()
      const innerW = window.innerWidth
      const innerH = window.innerHeight
      setPos({
        left: x + r.width > innerW - 8 ? Math.max(8, innerW - r.width - 8) : x,
        top: y + r.height > innerH - 8 ? Math.max(8, innerH - r.height - 8) : y,
      })
    }
    function down(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('mousedown', down)
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('mousedown', down)
      window.removeEventListener('keydown', key)
    }
  }, [x, y, onClose])

  return (
    <div ref={ref} className="vos-ctx" style={{ left: pos.left, top: pos.top }}>
      {items.map((it, i) =>
        it.sep ? (
          <div key={i} className="vos-ctx-sep" />
        ) : it.sub ? (
          <div key={i} className="vos-ctx-item has-sub" onMouseEnter={() => setOpenSub(i)}>
            {it.icon && <Mi n={it.icon} />}
            <span>{it.label}</span>
            <Mi n="chevron_right" className="vos-ctx-arrow" />
            {openSub === i && (
              <div className="vos-ctx vos-ctx-sub">
                {it.sub.map((s, j) => (
                  <button
                    key={j}
                    className="vos-ctx-item"
                    onClick={() => {
                      s.action?.()
                      onClose()
                    }}
                  >
                    {s.icon && <Mi n={s.icon} />}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            key={i}
            className="vos-ctx-item"
            onClick={() => {
              it.action?.()
              onClose()
            }}
          >
            {it.icon && <Mi n={it.icon} />}
            <span>{it.label}</span>
          </button>
        ),
      )}
    </div>
  )
}
