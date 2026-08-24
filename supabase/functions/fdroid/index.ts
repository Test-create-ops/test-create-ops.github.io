// Edge Function: fdroid
// Scarica index.xml di F-Droid lato server (niente CORS), estrae i primi N
// app e le serve in JSON compatto. Legge lo stream a blocchi e si ferma
// appena ha abbastanza applicazioni (non scarica i 15 MB per intero).
// Il risultato resta in memoria nell'isolate: dopo la prima chiamata è istantaneo.
const XML_URL = 'https://f-droid.org/repo/index.xml'
const LIMIT = 200
const CACHE_MS = 6 * 60 * 60 * 1000 // 6 ore

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Cache globale dell'isolate (sopravvive tra richieste finché la funzione è calda)
let memCache: { body: string; at: number } | null = null

function field(block: string, tag: string): string {
  const m = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`).exec(block)
  return m ? m[1].trim() : ''
}

async function buildCatalog(): Promise<string> {
  const res = await fetch(XML_URL)
  if (!res.ok || !res.body) throw new Error(`F-Droid HTTP ${res.status}`)

  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  let scanFrom = 0
  const apps: Record<string, string>[] = []

  while (apps.length < LIMIT) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })

    let end = buf.indexOf('</application>', scanFrom)
    while (end !== -1 && apps.length < LIMIT) {
      const start = buf.lastIndexOf('<application ', end)
      if (start !== -1 && start >= scanFrom) {
        const block = buf.slice(start, end)
        const pkg = field(block, 'id')
        if (pkg) {
          apps.push({
            packageName: pkg,
            name: field(block, 'name') || pkg,
            summary: field(block, 'summary'),
            icon: (() => {
              const ic = field(block, 'icon')
              return ic ? `https://f-droid.org/repo/${ic}` : ''
            })(),
          })
        }
      }
      scanFrom = end + '</application>'.length
      end = buf.indexOf('</application>', scanFrom)
    }
    if (apps.length >= LIMIT) await reader.cancel()
  }

  return JSON.stringify({ ok: true, count: apps.length, apps })
}

Deno.serve(async (_req) => {
  if (_req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    if (memCache && Date.now() - memCache.at < CACHE_MS) {
      return new Response(memCache.body, {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    const body = await buildCatalog()
    memCache = { body, at: Date.now() }
    return new Response(body, {
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
