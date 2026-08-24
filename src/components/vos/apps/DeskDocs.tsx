import { useEffect, useState } from 'react'
import { loadDeskItems, saveDeskItems, type DeskItem } from '../storage'
import { Mi } from '../../Mi'

function findItem(id: string): DeskItem | undefined {
  return loadDeskItems().find((i) => i.id === id)
}

/* Editor di documento di testo creato dal menu "Nuova" */
export function TextDoc({ itemId }: { itemId: string }) {
  const [item, setItem] = useState<DeskItem | undefined>(() => findItem(itemId))

  useEffect(() => {
    if (!item) return
    const t = setTimeout(() => {
      const items = loadDeskItems()
      saveDeskItems(items.map((i) => (i.id === item.id ? { ...i, content: item.content } : i)))
    }, 400)
    return () => clearTimeout(t)
  }, [item])

  if (!item) return <p className="vemo-empty">Documento non trovato</p>

  return (
    <div className="vtextdoc">
      <textarea
        value={item.content}
        onChange={(e) => setItem({ ...item, content: e.target.value })}
        placeholder="Scrivi qui… (salvataggio automatico)"
        autoFocus
      />
    </div>
  )
}

/* Finestra cartella */
export function FolderView({ itemId }: { itemId: string }) {
  const item = findItem(itemId)
  return (
    <div className="vfolder">
      <Mi n="folder_open" />
      <b>{item?.name ?? 'Cartella'}</b>
      <p>Cartella vuota — trascina i file qui (in arrivo)</p>
    </div>
  )
}
