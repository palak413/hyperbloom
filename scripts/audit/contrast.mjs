import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })
const mk = (screen, o = {}) => JSON.stringify({ screen, triage: { county: 'yes', adult: 'yes', situation: 'behind' }, docs: { id: 'have' }, answers: { name: 'Maria Santos', dob: '1990-05-04', email: 'm@e.com', size: '3', income: '4200', rent: '1350', owed: '2700', landlord: 'Riverbend', contact: 'email', declare: ['yes'] }, qi: 3, last: screen, official: true, textSize: 0, ref: 'CF-TEST-1234', submittedAt: new Date().toISOString(), ...o })
const scan = () => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true })
  const parse = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 } }
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
  const bgOf = (el) => { let layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c.a > 0) layers.push(c); if (c.a >= 1) break } let base = { r: 246, g: 245, b: 242 }; for (const l of layers.reverse()) base = { r: l.r * l.a + base.r * (1 - l.a), g: l.g * l.a + base.g * (1 - l.a), b: l.b * l.a + base.b * (1 - l.a) }; return base }
  const out = []
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('.sr-only') || el.closest('svg')) continue
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    if (!own) continue
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0 || el.closest('[disabled]')) continue
    const r = el.getBoundingClientRect(); if (r.width <= 2 || r.height <= 2) continue
    const fg = parse(cs.color), bg = bgOf(el); const fgc = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) }
    const L1 = lum(fgc), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
    const px = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700; const large = px >= 24 || (px >= 18.66 && bold)
    if (ratio < (large ? 3 : 4.5)) out.push(`${ratio.toFixed(2)}:1 ${el.tagName}.${String(el.className).slice(0, 40)} "${el.textContent.trim().slice(0, 40)}"`)
  }
  return out
}
let total = 0
for (const [name, screen, o] of [['welcome', 'welcome', {}], ['triage', 'triage', {}], ['docs', 'docs', {}], ['ask', 'ask', {}], ['ask-multi', 'ask', { qi: 5 }], ['review', 'review', {}], ['done', 'done', {}]]) {
  const ctx = await b.newContext({ viewport: { width: 1366, height: 860 }, reducedMotion: 'reduce' })
  await ctx.addInitScript((s) => localStorage.setItem('clearform.v1', s), mk(screen, o))
  const p = await ctx.newPage(); await p.goto('http://localhost:4173/'); await p.waitForTimeout(300)
  if (screen === 'welcome') await p.getByRole('button', { name: /Clear it all up/ }).click().catch(() => {})
  const r = await p.evaluate(scan); total += r.length
  console.log(name, r.length ? r : 'ok')
  await ctx.close()
}
console.log('contrast failures:', total)
await b.close()
