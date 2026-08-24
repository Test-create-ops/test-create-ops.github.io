export interface VosAppDef {
  id: string
  name: string
  icon: string
  dock: boolean
}

export const VOS_APPS: VosAppDef[] = [
  { id: 'sac', name: 'SAC Console', icon: 'terminal', dock: true },
  { id: 'emoji', name: 'Emoji', icon: 'mood', dock: false },
  { id: 'vps', name: 'Visual Pixel Studio', icon: 'code', dock: true },
  { id: 'fpixel', name: 'F-Pixel Store', icon: 'shop', dock: true },
  { id: 'terminal', name: 'Terminal', icon: 'terminal', dock: true },
  { id: 'files', name: 'Files', icon: 'folder', dock: true },
  { id: 'navigator', name: 'Navigator', icon: 'language', dock: true },
  { id: 'notes', name: 'Notes', icon: 'note', dock: true },
  { id: 'calculator', name: 'Calculator', icon: 'calculate', dock: true },
  { id: 'music', name: 'Music', icon: 'music_note', dock: true },
  { id: 'gallery', name: 'Gallery', icon: 'photo_library', dock: true },
  { id: 'calendar', name: 'Calendar', icon: 'calendar_today', dock: true },
  { id: 'mail', name: 'Mail', icon: 'mail', dock: true },
  { id: 'clock', name: 'Clock', icon: 'schedule', dock: true },
  { id: 'weather', name: 'Weather', icon: 'cloud', dock: true },
  { id: 'messages', name: 'Messages', icon: 'chat', dock: true },
  { id: 'monitor', name: 'Monitor', icon: 'monitor_heart', dock: true },
  { id: 'paint', name: 'Paint', icon: 'brush', dock: true },
  { id: 'settings', name: 'Settings', icon: 'settings', dock: true },
]

export function getApp(id: string): VosAppDef | undefined {
  return VOS_APPS.find((a) => a.id === id)
}
