// Edge Function: fdroid-apk?pkg=<packageName>
// Trova l'ultima versione di un pacchetto F-Droid e fa da proxy per
// scaricare l'APK vero aggiungendo gli header CORS (F-Droid non li manda).
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  const pkg = new URL(req.url).searchParams.get('pkg')
  if (!pkg || !/^[a-zA-Z0-9._]+$/.test(pkg)) {
    return new Response(JSON.stringify({ error: 'parametro pkg mancante o non valido' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  try {
    // 1. versione suggerita dal API pubblica F-Droid
    const meta = await fetch(`https://f-droid.org/api/v1/packages/${pkg}`)
    if (!meta.ok) throw new Error(`API F-Droid HTTP ${meta.status}`)
    const info = await meta.json()
    const code = info?.suggestedVersionCode
    if (!code) throw new Error('versionCode non trovato')

    // 2. proxy dell'APK vero (streaming: nessun buffer in memoria)
    const apk = await fetch(`https://f-droid.org/repo/${pkg}_${code}.apk`)
    if (!apk.ok || !apk.body) throw new Error(`APK HTTP ${apk.status}`)

    const headers = new Headers(CORS_HEADERS)
    headers.set('Content-Type', 'application/vnd.android.package-archive')
    headers.set('X-Apk-Version', String(info.suggestedVersionName ?? ''))
    const len = apk.headers.get('content-length')
    if (len) headers.set('Content-Length', len)
    return new Response(apk.body, { headers })
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'errore sconosciuto' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }
})
