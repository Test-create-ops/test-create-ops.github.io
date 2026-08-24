export interface VosConfig {
  setupComplete: boolean
  userName: string
  password: string
  wallpaper: string
}

const KEY = 'kairo-vos-config'

export function loadVosConfig(): VosConfig {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as VosConfig
  } catch {
    /* ignore */
  }
  return {
    setupComplete: false,
    userName: '',
    password: '',
    wallpaper: 'gradient',
  }
}

export function saveVosConfig(config: VosConfig): void {
  localStorage.setItem(KEY, JSON.stringify(config))
}

export function resetVosConfig(): void {
  localStorage.removeItem(KEY)
}
