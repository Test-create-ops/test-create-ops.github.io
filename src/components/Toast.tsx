import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface ToastCtx {
  toast: (msg: string) => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })

export function useToast() {
  return useContext(Ctx)
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msgs, setMsgs] = useState<{ id: number; text: string }[]>([])

  const toast = useCallback((text: string) => {
    const id = nextId++
    setMsgs((m) => [...m, { id, text }])
    setTimeout(() => setMsgs((m) => m.filter((x) => x.id !== id)), 1800)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      {msgs.map((m) => (
        <div key={m.id} className="toast">
          {m.text}
        </div>
      ))}
    </Ctx.Provider>
  )
}
