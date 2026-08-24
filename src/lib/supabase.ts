import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://skswsufsnxebebahnhtc.supabase.co'
export const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrc3dzdWZzbnhlYmViYWhuaHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTk4OTUsImV4cCI6MjEwMTEzNTg5NX0.G-zlyvK-Y8bzjMX6qCH_SUH_nOUPQh8HcPv2Eve--Cc'

/* Il token JWT arriva da Clerk (third-party auth) */
let tokenGetter: () => Promise<string | null> = async () => null
export function setTokenGetter(fn: () => Promise<string | null>) {
  tokenGetter = fn
}

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON, {
  accessToken: () => tokenGetter(),
})

export const EDGE = SUPABASE_URL + '/functions/v1/send-mail'

export interface Profile {
  id: string
  username: string
  avatar_url?: string | null
  cert_code?: string | null
  certified?: boolean | null
}

export async function sendMail(
  token: string | undefined,
  username: string,
  type: string,
  extra: Record<string, unknown> = {}
): Promise<{ error?: string }> {
  if (!token) return { error: 'non loggato' }
  try {
    const r = await fetch(EDGE, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ token, type, username, ...extra }),
    })
    const d = await r.json().catch(() => ({}))
    return r.ok ? d : { error: d.error || 'HTTP ' + r.status }
  } catch (ex) {
    return { error: ex instanceof Error ? ex.message : String(ex) }
  }
}

export function genCode(): string {
  return (
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    Math.floor(10 + Math.random() * 89)
  )
}

export function hashSig(str: string): string {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0
  return (h >>> 0).toString(16).toUpperCase().padStart(8, '0')
}
