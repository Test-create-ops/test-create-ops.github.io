// Edge Function: fdroid
// Scarica l'indice F-Droid lato server (niente CORS) e restituisce
// solo i primi N app in formato compatto (~100 KB invece di 59 MB).
const INDEX = 'https://f-droid.org/repo/index-v1.json'
const LIMIT = 200

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

Deno.serve(async (_req) => {
  if (_req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const res = await fetch(INDEX, { headers: { 'Accept-Encoding': 'gzip' } })
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `F-Droid HTTP ${res.status}` }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }
    const data = await res.json()
    const apps = (data?.apps ?? []).slice(0, LIMIT).map((a: Record<string, unknown>) => {
      const loc = (a.localized ?? {}) as Record<string, { name?: string; summary?: string }>
      const en = loc.en ?? {}
      const it = loc.it ?? {}
      const nameObj = a.name as { en?: string; it?: string } | undefined
      const sumObj = a.summary as { en?: string; it?: string } | undefined
      return {
        packageName: a.packageName,
        name: en.name || it.name || nameObj?.en || nameObj?.it || a.packageName,
        summary: en.summary || it.summary || sumObj?.en || sumObj?.it || '',
        icon: typeof a.icon === 'string' && a.icon ? `https://f-droid.org/repo/${a.icon}` : '',
      }
    })
    return new Response(JSON.stringify({ ok: true, count: apps.length, apps }), {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'errore sconosciuto' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }
})
