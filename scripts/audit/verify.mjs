// Run: npm run build && npx vite preview --port 4173 &  then  node scripts/audit/verify.mjs ./audit-out
// Needs: npm i -D playwright (and a Chromium; set executablePath if needed). axe-core is already a devDependency.
import { chromium } from 'playwright'
import fs from 'fs'
const S = process.argv[2] ?? '.'
const AXE = fs.readFileSync(new URL('../../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
const URL = 'http://localhost:4173/'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })
const results = []; const errs = []
const check = (name, ok, extra = '') => { results.push({ name, ok: !!ok }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra && !ok ? '  → ' + extra : '')) }

const FULL = { name: 'Maria Santos', dob: '1990-05-04', email: 'maria@example.com', size: '3', income: '4200', sources: ['work'], rent: '1350', owed: '2700', landlord: 'Riverbend Properties', contact: 'email', notes: '', declare: ['yes'] }
const seed = (screen, over = {}) => JSON.stringify({ screen, triage: { county: 'yes', adult: 'yes', situation: 'behind' }, docs: { id: 'have', income: 'later', lease: 'have', notice: 'later' }, answers: FULL, qi: 3, fromReview: false, last: screen, official: false, textSize: 0, ref: screen === 'done' ? 'CF-TEST-1234' : undefined, submittedAt: new Date().toISOString(), ...over })

async function open(vp = { width: 1366, height: 860 }, st = null, opts = {}) {
  const ctx = await b.newContext({ viewport: vp, ...opts })
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {})
  if (st) await ctx.addInitScript((s) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('clearform.v1', s); sessionStorage.setItem('seeded', '1') } }, st)
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  await p.goto(URL); await p.waitForTimeout(400)
  return { ctx, p }
}
const field = (p) => p.locator('input:not([type=radio]):not([type=checkbox]), textarea').first()
const alertText = async (p) => (await p.getByRole('alert').first().innerText().catch(() => '')).replace(/^!\s*/, '')
const active = (p) => p.evaluate(() => document.activeElement?.tagName + (document.activeElement?.id ? '#' + document.activeElement.id : ''))

// ---------- 1. VALIDATION ----------
{
  const { ctx, p } = await open()
  await p.getByRole('button', { name: /Start your application/ }).click()
  await p.getByText('Yes', { exact: true }).first().click(); await p.getByText('Yes', { exact: true }).nth(1).click(); await p.getByText('I’m behind on rent').click()
  await p.getByRole('button', { name: /See what I’ll need/ }).click(); await p.getByRole('button', { name: /Start the questions/ }).click()
  const tryV = async (v, expect, label) => { await field(p).fill(v); await p.keyboard.press('Enter'); await p.waitForTimeout(120); const t = await alertText(p); check(`validation: ${label}`, expect ? new RegExp(expect, 'i').test(t) : !t, t) }
  check('after Continue, field is focused (type immediately)', /INPUT/.test(await active(p)), await active(p))
  await p.keyboard.press('Enter'); await p.waitForTimeout(120); check('validation: empty required name', /answer/i.test(await alertText(p)), await alertText(p))
  await tryV('M', 'two characters', 'name too short'); await tryV('Maria Santos', null, 'valid name advances')
  check('Enter advanced to Question 2', /Question 2 of/.test(await p.locator('main').innerText()))
  await tryV('2012-03-01', '18 or older', 'under 18'); await tryV('2099-01-01', 'future', 'future DOB')
  const y = new Date().getFullYear() - 18; const m = String(new Date().getMonth() + 1).padStart(2, '0'); const d = String(new Date().getDate() + 1 > 28 ? 28 : new Date().getDate() + 1).padStart(2, '0')
  await tryV(`${y}-${m}-${d}`, '18 or older', 'turns 18 tomorrow-ish is rejected'); await tryV('1990-05-04', null, 'valid DOB')
  await tryV('maria@', 'email', 'bad email'); await tryV('maria@example.com', null, 'valid email')
  await tryV('2.5', 'whole number', 'household 2.5'); await tryV('0', 'or more', 'household 0'); await tryV('13', 'or less', 'household 13'); await tryV('3', null, 'household 3')
  await field(p).fill('abc'); check('number field strips letters', (await field(p).inputValue()) === '', await field(p).inputValue())
  await tryV('4,200', null, 'income with comma')
  await ctx.close()
}

// ---------- 2. PERSISTENCE + RESUME ----------
{
  const { ctx, p } = await open({ width: 1366, height: 860 }, seed('ask', { qi: 4, answers: { ...FULL, income: '' } }))
  check('reload restores question screen', /Question 5 of/.test(await p.locator('main').innerText()))
  await field(p).fill('3900'); await p.waitForTimeout(150)
  await p.reload(); await p.waitForTimeout(300)
  check('typed value persists across reload', (await field(p).inputValue()) === '3900', await field(p).inputValue())
  await p.getByRole('button', { name: 'ClearForm home' }).click()
  const cont = p.getByRole('button', { name: /Continue where you left off/ })
  check('welcome offers continue after logo click', await cont.count() === 1)
  await cont.click(); await p.waitForTimeout(150)
  check('continue returns to the same question', /Question 5 of/.test(await p.locator('main').innerText()))
  await ctx.close()
}

// ---------- 3. EDIT FLOW FROM REVIEW ----------
{
  const { ctx, p } = await open({ width: 1366, height: 860 }, seed('review'))
  check('review summary shows income', /\$4,200/.test(await p.locator('main').innerText()))
  await p.getByRole('button', { name: /Change.*monthly rent/i }).click(); await p.waitForTimeout(150)
  check('edit button opens that question with Save change', await p.getByRole('button', { name: 'Save change' }).count() === 1 && /monthly rent/.test(await p.locator('h1').innerText()))
  await field(p).fill('1500'); await p.keyboard.press('Enter'); await p.waitForTimeout(200)
  const rv = await p.locator('main').innerText()
  check('edit returns to review with new value', /Review|One last look/.test(rv) && /\$1,500/.test(rv) && /pays \$1,500 in rent/.test(rv))
  await p.getByRole('button', { name: /Change.*landlord/i }).click(); await field(p).fill('Z'); await p.keyboard.press('Enter')
  check('edit still validates', /two characters/.test(await alertText(p)))
  await p.getByRole('button', { name: 'Cancel' }).click(); await p.waitForTimeout(150)
  check('cancel returns to review unchanged', /Riverbend Properties/.test(await p.locator('main').innerText()))
  await ctx.close()
}

// ---------- 4. BRANCHING ----------
{
  const { ctx, p } = await open({ width: 1366, height: 860 }, seed('docs', { triage: { county: 'yes', adult: 'yes', situation: 'moving' }, answers: {} }))
  const t = await p.locator('main').innerText()
  check('moving: shows new-lease doc, hides late-rent notice', /new lease/i.test(t) && !/late-rent notice/i.test(t))
  await p.getByRole('button', { name: /Start the questions/ }).click()
  const all = await p.locator('aside').innerText()
  check('moving: asks deposit, not rent owed', /deposit/i.test(all) && !/rent owed/i.test(all) && !/monthly rent/i.test(all), all)
  await ctx.close()
}
for (const [label, tri] of [['county=no', { county: 'no', adult: 'yes', situation: 'behind' }], ['adult=no', { county: 'yes', adult: 'no', situation: 'behind' }]]) {
  const { ctx, p } = await open({ width: 1366, height: 860 }, seed('triage', { triage: {}, answers: {} }))
  await p.locator('label', { has: p.locator(`input[name=county][value=${tri.county}]`) }).click()
  await p.locator('label', { has: p.locator(`input[name=adult][value=${tri.adult}]`) }).click()
  await p.getByText('I’m behind on rent').click()
  await p.getByRole('button', { name: /See what I’ll need/ }).click(); await p.waitForTimeout(150)
  check(`triage exit path: ${label}`, /right fit|guardian/i.test(await p.locator('h1').innerText()), await p.locator('h1').innerText())
  await ctx.close()
}

// ---------- 5. RECEIPT + 6. RESTART ----------
{
  const { ctx, p } = await open({ width: 1366, height: 860 }, seed('review'))
  await p.getByRole('button', { name: /Send my application/ }).click(); await p.waitForTimeout(400)
  const t = await p.locator('main').innerText()
  const ref = (t.match(/CF-[A-Z0-9]{4}-\d{4}/) || [])[0]
  check('receipt has reference number', !!ref, t.slice(0, 200))
  check('receipt timeline has 4 dated steps', (t.match(/By [A-Z][a-z]{2} \d+/g) || []).length === 3 && /Today/.test(t))
  check('receipt lists documents still to bring', /Still to bring/.test(t) && /Proof of income/.test(t) && /late-rent notice/.test(t))
  await p.getByRole('button', { name: 'Copy', exact: true }).click(); await p.waitForTimeout(200)
  check('copy reference gives feedback', await p.getByRole('button', { name: 'Copied' }).count() === 1)
  const clip = await p.evaluate(() => navigator.clipboard.readText()).catch(() => 'n/a'); check('clipboard holds reference', clip === ref, clip)
  await p.getByRole('button', { name: /Copy my receipt/ }).click(); await p.waitForTimeout(200)
  const clip2 = await p.evaluate(() => navigator.clipboard.readText()).catch(() => 'n/a'); check('copy receipt includes summary + timeline', /Maria|you’re asking/.test(clip2) && /Application received/.test(clip2), clip2.slice(0, 80))
  await p.reload(); await p.waitForTimeout(300)
  check('receipt survives reload with same ref', (await p.locator('main').innerText()).includes(ref))
  await p.getByRole('button', { name: 'Back to my answers' }).click(); await p.getByRole('button', { name: /Send my application/ }).click(); await p.waitForTimeout(300)
  check('re-sending keeps the same reference', (await p.locator('main').innerText()).includes(ref))
  await p.getByRole('button', { name: 'Start over' }).click()
  check('start over asks inline, does not erase yet', await p.getByRole('button', { name: 'Yes, erase' }).count() === 1 && (await p.evaluate(() => localStorage.getItem('clearform.v1'))) !== null)
  await p.getByRole('button', { name: 'Keep it' }).click(); check('keep it cancels', await p.getByRole('button', { name: 'Start over' }).count() === 1)
  await p.getByRole('button', { name: 'Start over' }).click(); await p.getByRole('button', { name: 'Yes, erase' }).click(); await p.waitForTimeout(300)
  const st = JSON.parse((await p.evaluate(() => localStorage.getItem('clearform.v1'))) || '{}')
  check('restart returns to welcome with clean state', /Government forms/.test(await p.locator('h1').innerText()) && Object.keys(st.answers || {}).length === 0 && !st.ref, JSON.stringify(st).slice(0, 120))
  await ctx.close()
}

// ---------- 7. KEYBOARD, GLOSSARY, OFFICIAL WORDING ----------
{
  const { ctx, p } = await open({ width: 1366, height: 860 }, seed('ask', { qi: 3, answers: {} }))
  const h1 = await p.locator('h1').innerText(); check('glossary question renders term text', /household/.test(h1))
  const term = p.locator('h1 button'); await term.focus(); await p.keyboard.press('Enter')
  check('term opens definition via keyboard', (await term.getAttribute('aria-expanded')) === 'true' && /Everyone who lives/.test(await p.locator('main').innerText()))
  await p.keyboard.press('Escape'); check('Escape closes term', (await term.getAttribute('aria-expanded')) === 'false')
  await p.getByRole('switch').click(); check('official wording toggle reveals legal text', /official wording/i.test(await p.locator('main').innerText()) && /household unit/.test(await p.locator('main').innerText()))
  await p.getByRole('button', { name: /Why are you asking/ }).click(); check('why disclosure opens', /depends on how many/.test(await p.locator('main').innerText()))
  await ctx.close()
}
{ // radio keyboard operation in triage
  const { ctx, p } = await open({ width: 1366, height: 860 }, seed('triage', { triage: {}, answers: {} }))
  await p.locator('input[name=county]').first().focus(); await p.keyboard.press('Space')
  check('triage radio selectable by keyboard', await p.locator('input[name=county]').first().isChecked())
  await p.keyboard.press('ArrowDown'); check('arrow keys move radio selection', await p.locator('input[name=county]').nth(1).isChecked())
  await ctx.close()
}

// ---------- 8. REDUCED MOTION + RESPONSIVE OVERFLOW ----------
for (const vp of [{ width: 320, height: 700 }, { width: 390, height: 844 }, { width: 768, height: 1000 }, { width: 1366, height: 860 }]) {
  for (const ts of [0, 3]) {
    const bad = []
    for (const screen of ['welcome', 'triage', 'out', 'docs', 'ask', 'review', 'done']) {
      const { ctx, p } = await open(vp, seed(screen, { textSize: ts, triage: screen === 'out' ? { county: 'no' } : { county: 'yes', adult: 'yes', situation: 'behind' } }), { reducedMotion: 'reduce' })
      await p.waitForTimeout(250)
      const o = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }))
      if (o.sw > o.iw + 1) bad.push(`${screen}(${o.sw}>${o.iw})`)
      await ctx.close()
    }
    check(`no horizontal overflow @${vp.width}px, text +${ts}`, bad.length === 0, bad.join(' '))
  }
}

// ---------- 9. AXE ----------
console.log('\n=== AXE (automated: wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice) ===')
const axeAll = []
const states = [
  ['welcome', 'welcome', {}], ['triage', 'triage', { triage: {}, answers: {} }], ['out', 'out', { triage: { county: 'no' } }], ['docs', 'docs', {}],
  ['ask:text', 'ask', { qi: 0 }], ['ask:number+term', 'ask', { qi: 3 }], ['ask:multi', 'ask', { qi: 5 }], ['ask:choice', 'ask', { qi: 9 }], ['ask:date', 'ask', { qi: 1 }], ['ask:textarea', 'ask', { qi: 10 }], ['ask:consent', 'ask', { qi: 11 }],
  ['ask:official', 'ask', { qi: 4, official: true }], ['review', 'review', {}], ['done', 'done', {}],
]
for (const vp of [{ width: 1366, height: 860 }, { width: 390, height: 844 }]) {
  for (const [name, screen, over] of states) {
    const { ctx, p } = await open(vp, seed(screen, over), { reducedMotion: 'reduce' })
    await p.waitForTimeout(250)
    if (name === 'ask:number+term') { await p.locator('h1 button').click(); }
    if (name === 'ask:text') { await p.keyboard.press('Enter'); await p.waitForTimeout(100) }
    if (name === 'ask:text' || name === 'ask:number+term') await p.evaluate(() => 0)
    await p.addScriptTag({ content: AXE })
    const r = await p.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } }).then((x) => ({ v: x.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, sample: v.nodes.slice(0, 2).map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n').slice(1, 3).join(' ')) })), passes: x.passes.length, inc: x.incomplete.map((i) => i.id) })))
    axeAll.push({ vp: vp.width, name, ...r })
    console.log(`${vp.width}px ${name}: ${r.v.length} violations, ${r.passes} rules passed${r.inc.length ? ', needs-review: ' + [...new Set(r.inc)].join(',') : ''}`)
    r.v.forEach((v) => console.log(`   [${v.impact}] ${v.id} ×${v.n} — ${v.help}\n      ${v.sample.join('\n      ')}`))
    await ctx.close()
  }
}
fs.writeFileSync(S + '/axe.json', JSON.stringify(axeAll, null, 1))
const fails = results.filter((r) => !r.ok)
console.log(`\nFUNCTIONAL: ${results.length - fails.length}/${results.length} passed`); fails.forEach((f) => console.log('  FAILED:', f.name))
console.log('console/page errors:', errs.length ? errs : 'none')
await b.close()
