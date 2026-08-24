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
  localStorage.removeItem('kairo-vos-config')
}

/* ── App installate via SAC (System APK Converter) ── */
export interface SacAppData {
  pkg: string
  name: string
  version: string
  icon: string // dataURL
  permissions: string[]
  installedAt: number
}

const SAC_KEY = 'kairo-vos-sac-apps'

export function loadSacApps(): SacAppData[] {
  try {
    const raw = localStorage.getItem(SAC_KEY)
    if (raw) return JSON.parse(raw) as SacAppData[]
  } catch {
    /* ignore */
  }
  return []
}

export function saveSacApps(apps: SacAppData[]): void {
  localStorage.setItem(SAC_KEY, JSON.stringify(apps))
}

export function addSacApp(app: SacAppData): void {
  const list = loadSacApps().filter((a) => a.pkg !== app.pkg)
  saveSacApps([...list, app])
}

export function removeSacApp(pkg: string): void {
  saveSacApps(loadSacApps().filter((a) => a.pkg !== pkg))
}
