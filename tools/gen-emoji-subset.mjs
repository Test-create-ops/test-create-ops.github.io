// Genera public/emoji/: sottoinsieme di OpenMoji + fxemoji con manifest
// Uso: node tools/gen-emoji-subset.mjs
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OM_DIR = path.join(root, 'node_modules/openmoji')
const FX_DIR = path.join(root, 'node_modules/@iconify-icons/fxemoji/data')
const OUT = path.join(root, 'public/emoji')

const om = JSON.parse(fs.readFileSync(path.join(OM_DIR, 'data/openmoji.json'), 'utf8'))

/* Criteri di selezione: tutto il gruppo facce + keyword scelte nel resto */
const GROUP_CAPS = { 'smileys-emotion': 999 }
const KEYWORDS = [
  'heart', 'fire', 'star', 'sparkles', 'rocket', 'pizza', 'hamburger', 'cake',
  'cat face', 'dog face', 'mouse face', 'monkey face', 'panda', 'penguin',
  'soccer ball', 'basketball', 'trophy', 'video game', 'musical note', 'guitar',
  'sun', 'rainbow', 'cloud', 'snowflake', 'lightning', 'moon face',
  'thumbs up', 'ok hand', 'clapping hands', 'raised hands', 'folded hands',
  'flexed biceps', 'waving hand', 'hourglass', 'alarm clock', 'camera',
  'laptop computer', 'desktop computer', 'mobile phone', 'headphone',
  'books', 'pencil', 'memo', 'locked', 'key', 'gift', 'balloon', 'party popper',
  'crown', 'eyeglasses', 't-shirt', 'coffee', 'tea', 'beer mug', 'apple',
  'banana', 'strawberry', 'avocado', 'car', 'airplane', 'house', 'hospital',
  'money bag', 'gem stone', 'light bulb', 'magnifying glass tilted',
]
function pick(entries) {
  const out = []
  const seen = new Set()
  for (const e of entries) {
    if (e.skintone || e.skintone_combination) continue
    const g = e.group || ''
    const cap = GROUP_CAPS[g]
    const anno = (e.annotation || '').toLowerCase()
    const wanted = typeof cap === 'number' ? true : KEYWORDS.some((k) => anno.includes(k))
    if (!wanted) continue
    const key = e.hexcode
    if (seen.has(key)) continue
    // limite per gruppo non-cappato
    if (typeof cap !== 'number') {
      const cnt = out.filter((o) => o.group === g).length
      if (cnt >= 12) continue
    }
    seen.add(key)
    out.push(e)
  }
  return out
}

const chosen = pick(om)
console.log('emoji selezionate:', chosen.length)

/* Indice fxemoji normalizzato */
const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '')
const fxIndex = new Map()
for (const letter of fs.readdirSync(FX_DIR)) {
  const dir = path.join(FX_DIR, letter)
  if (!fs.statSync(dir).isDirectory()) continue
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.js')) continue
    fxIndex.set(norm(f.slice(0, -3)), path.join(dir, f))
  }
}
console.log('icone fxemoji disponibili:', fxIndex.size)

/* Cartelle output */
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(path.join(OUT, 'openmoji'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'fxemoji'), { recursive: true })

let fxOk = 0
const manifest = []
for (const e of chosen) {
  const srcOm = path.join(OM_DIR, `color/svg/${e.hexcode}.svg`)
  const hasOm = fs.existsSync(srcOm)
  if (hasOm) fs.copyFileSync(srcOm, path.join(OUT, 'openmoji', `${e.hexcode}.svg`))

  let hasFx = false
  const target = fxIndex.get(norm(e.annotation))
  if (target) {
    const mod = require(target)
    const d = mod.default ?? mod
    if (d?.body) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${d.width ?? 512} ${d.height ?? 512}">${d.body}</svg>`
      fs.writeFileSync(path.join(OUT, 'fxemoji', `${e.hexcode}.svg`), svg)
      hasFx = true
      fxOk++
    }
  }

  manifest.push({
    hex: e.hexcode,
    char: e.emoji,
    name: e.annotation,
    group: e.group,
    om: hasOm,
    fx: hasFx,
  })
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest))
console.log(`fatto: ${manifest.length} voci · openmoji ok · fxemoji abbinate: ${fxOk}`)
