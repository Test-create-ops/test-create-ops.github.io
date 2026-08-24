import { addSacApp, type SacAppData } from '../storage'
import { sacLog } from './sacLog'
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
  sacLog(`═══ Installazione ${pkg} ═══`)
  try {
    // 1. Download
    sacLog(`[1/5] Scarico l'APK da f-droid.org (via proxy Supabase)…`)
    const res = await fetch(`${EDGE_APK}?pkg=${encodeURIComponent(pkg)}`)
    sacLog(`[1/5] Risposta server: HTTP ${res.status}`, res.ok ? 'ok' : 'err')
    if (!res.ok) throw new SacError(`Download APK fallito (HTTP ${res.status})`)

    const blob = await res.blob()
    const mb = (blob.size / 1024 / 1024).toFixed(1)
    sacLog(`[2/5] APK scaricato: ${mb} MB`, 'ok')

    // 2. Parsing — FIX: serve un File con .name (Blob anonimo crasha la libreria)
    sacLog(`[3/5] Apro l'archivio APK e leggo il manifest…`)
    const file = new File([blob], `${pkg}.apk`, {
      type: 'application/vnd.android.package-archive',
    })
    const mod = await import('app-info-parser')
    const ApkParser = mod.default
    const parser = new ApkParser(file)
    const result = await parser.parse()
    sacLog(`[3/5] Manifest letto correttamente`, 'ok')

    // 3. Estrazione campi
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const r = result as any
    const manifest = r.manifest ?? {}
    const appEl = manifest.application ?? {}
    const perms: string[] = Array.isArray(manifest.usesPermissions)
      ? manifest.usesPermissions.map((p: any) =>
          String(p?.name ?? p ?? '').replace('android.permission.', ''),
        )
      : []

    const name =
      (typeof appEl.label === 'string' && appEl.label) ||
      (typeof r.basic?.appName === 'string' && r.basic.appName) ||
      pkg

    const iconRaw = appEl.icon ?? r.basic?.icon
    const icon = toDataUrl(iconRaw)
    sacLog(
      `[4/5] Dati estratti → nome: "${name}" · v${manifest.versionName ?? '?'} · permessi: ${perms.length} · icona: ${icon ? Math.round(icon.length / 1024) + ' KB' : 'assente'}`,
      'ok',
    )
    if (!icon) sacLog(`[4/5] Nota: l'app non ha un'icona nell'APK (uso fallback Android)`, 'info')

    // 4. Salvataggio in VOS
    const data: SacAppData = {
      pkg,
      name,
      version: String(manifest.versionName ?? ''),
      icon,
      permissions: perms.slice(0, 12),
      installedAt: Date.now(),
    }
    addSacApp(data)
    sacLog(`[5/5] App salvata in VOS ✓ Installazione completata`, 'ok')
    return data
  } catch (e) {
    const msg =
      e instanceof Error ? `${e.name}: ${e.message}` : 'errore sconosciuto'
    sacLog(`✗ INSTALLAZIONE FALLITA → ${msg}`, 'err')
    throw new SacError(msg)
  }
}
