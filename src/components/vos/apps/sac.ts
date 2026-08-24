import { addSacApp, type SacAppData } from '../storage'
import { SUPABASE_URL } from '../../../lib/supabase'

const EDGE_APK = SUPABASE_URL + '/functions/v1/fdroid-apk'

export class SacError extends Error {}

function toDataUrl(icon: unknown): string {
  if (typeof icon !== 'string' || !icon) return ''
  return icon.startsWith('data:') ? icon : `data:image/png;base64,${icon}`
}

/**
 * Scarica l'APK vero da F-Droid tramite la Edge Function e ne estrae
 * i dati reali (nome, versione, icona, permessi) con app-info-parser.
 */
export async function installSacApk(pkg: string): Promise<SacAppData> {
  const res = await fetch(`${EDGE_APK}?pkg=${encodeURIComponent(pkg)}`)
  if (!res.ok) throw new SacError(`Download APK fallito (${res.status})`)
  const blob = await res.blob()

  // Import dinamico: il parser finisce in un chunk separato
  const { default: ApkParser } = await import('app-info-parser')
  const parser = new ApkParser(blob)
  const result = await parser.parse()

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const r = result as any
  const manifest = r.manifest ?? {}
  const appEl = manifest.application ?? {}
  const perms: string[] = Array.isArray(manifest.usesPermissions)
    ? manifest.usesPermissions.map((p: any) => String(p?.name ?? p ?? '').replace('android.permission.', ''))
    : []

  const name =
    (typeof appEl.label === 'string' && appEl.label) ||
    (typeof r.basic?.appName === 'string' && r.basic.appName) ||
    pkg

  const data: SacAppData = {
    pkg,
    name,
    version: String(manifest.versionName ?? ''),
    icon: toDataUrl(appEl.icon ?? r.basic?.icon),
    permissions: perms.slice(0, 12),
    installedAt: Date.now(),
  }

  addSacApp(data)
  return data
}
