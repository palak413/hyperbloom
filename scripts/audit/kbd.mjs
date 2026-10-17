import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
const p = await ctx.newPage(); await p.goto('http://localhost:4173/'); await p.waitForTimeout(300)
const who = () => p.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { tag: e.tagName, text: (e.getAttribute('aria-label') || e.innerText || e.id || '').slice(0, 40).replace(/\n/g, ' '), outline: cs.outlineStyle + ' ' + cs.outlineWidth } })
const tabTo = async (re, max = 40) => { for (let i = 0; i < max; i++) { await p.keyboard.press('Tab'); const w = await who(); if (re.test(w.text)) return w } throw new Error('never reached ' + re + ' last=' + JSON.stringify(await who())) }
const log = []
let w = await tabTo(/Skip to content/); log.push(['skip link first', w.text])
await p.keyboard.press('Enter'); log.push(['skip link target focus', (await p.evaluate(() => document.activeElement.id))])
w = await tabTo(/Start your application|See your receipt|Continue/); log.push(['CTA reachable, focus ring', w.outline]); await p.keyboard.press('Enter'); await p.waitForTimeout(200)
log.push(['triage heading focused after nav', await p.evaluate(() => document.activeElement.tagName + ': ' + document.activeElement.innerText.slice(0, 30))])
// triage: tab into radios, choose with Space
for (const grp of ['county', 'adult', 'situation']) { await p.locator(`input[name=${grp}]`).first().focus(); await p.keyboard.press('Space') }
await tabTo(/See what I’ll need/); await p.keyboard.press('Enter'); await p.waitForTimeout(200)
for (let i = 0; i < 4; i++) { await tabTo(/I have it/); await p.keyboard.press('Enter') }
await tabTo(/Start the questions/); await p.keyboard.press('Enter'); await p.waitForTimeout(250)
const answers = ['Maria Santos', '05041990', 'maria@example.com', '3', '4200', null, '1350', '2700', 'Riverbend', null, null, null]
for (let i = 0; i < 12; i++) {
  const w = await who(); const f = answers[i]
  if (f && /INPUT|TEXTAREA/.test(w.tag)) { await p.keyboard.type(f) }
  else if (i === 5) { await p.keyboard.press('Space') }       // multi: first checkbox focused? ensure
  else if (i === 9) { await p.locator('input[name=contact]').first().focus(); await p.keyboard.press('Space') }
  else if (i === 11) { await p.locator('input[name=declare]').focus(); await p.keyboard.press('Space') }
  if (i === 5) { await p.locator('input[name=sources]').first().focus(); await p.keyboard.press('Space') }
  if (i === 10) { /* optional textarea: Tab to Skip button */ await tabTo(/Skip|Continue/) ; await p.keyboard.press('Enter'); await p.waitForTimeout(200); continue }
  if (i === 5 || i === 9 || i === 11) { await tabTo(/Continue|Review my answers|Skip/, 12); await p.keyboard.press('Enter') } else await p.keyboard.press('Enter')
  await p.waitForTimeout(200)
}
log.push(['reached review by keyboard', /One last look/.test(await p.locator('h1').innerText())])
await tabTo(/Send my application/); await p.keyboard.press('Enter'); await p.waitForTimeout(400)
log.push(['reached receipt by keyboard', /done|That’s it/.test(await p.locator('h1').innerText()), await p.locator('main').innerText().then((t) => (t.match(/CF-[A-Z0-9]{4}-\d{4}/) || [])[0])])
// reduced motion: animation durations collapsed
log.push(['reduced-motion animation-duration', await p.evaluate(() => getComputedStyle(document.querySelector('.rise') || document.body).animationDuration)])
// focus ring on an input
await p.getByRole('button', { name: 'Back to my answers' }).focus(); log.push(['focus ring on outline btn', (await who()).outline])
log.forEach((l) => console.log(...l))
await b.close()
