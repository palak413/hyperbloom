# Hyperbloom October 2026: ClearForm submission materials

Everything below is a draft for you to review. Replace bracketed items, and delete anything you cannot stand behind.

---

## Project name
ClearForm

## Tagline (pick one)
- Government forms, finally in plain words.
- Every question explained. Every step visible. Nothing lost.

## Short description (about 200 characters)
ClearForm turns a confusing application into a calm, one-question-at-a-time journey: what to bring, what each question means, and exactly what happens next. A plain-language, accessibility-first UI prototype.

---

## Inspiration / The problem

Application processes such as benefits, permits and renewals are often written in legal and administrative language, ask for a wall of fields at once, and say little about what happens afterwards. People get stuck on a term they do not recognise, gather documents they did not need, or submit without knowing what comes next.

This project is a design response to that, not a study of it. It does not cite statistics or research, because none were collected.

## Who it is for
People completing an application they do not do often and cannot afford to get wrong: first-time applicants, people filling in forms on a phone, people who read English as an additional language, and anyone stressed or short on time. The design also targets people who rely on keyboards or assistive technology, although see "Accessibility" for what has and has not been verified.

## What it does

ClearForm is a complete, working front-end journey through a **fictional** program ("Riverside Rent Relief"):

1. **Welcome**: a before/after slider shows the same rule as official wording and in plain words, so the idea is clear in seconds.
2. **Quick check**: three questions decide eligibility and tailor everything after. Ineligible people are told immediately, with alternatives, instead of after the whole form.
3. **What to bring**: only the documents relevant to the person's situation, each with a "don't have it?" fallback. Missing items are carried onto the receipt as reminders instead of blocking progress.
4. **Questions**: one at a time. Each has a "Why are you asking?" explanation, underlined glossary terms with plain definitions, helpful (not scolding) validation, and a live "your picture so far" panel. A header switch reveals the original legal wording next to every question.
5. **Review**: opens with a plain-English summary of what the person is applying for, lets them change any answer in one tap, and gently flags a likely income-limit mismatch without blocking submission.
6. **Receipt**: reference number, a dated "what happens next" timeline, a list of documents still to bring, and a copy-to-clipboard receipt.

Progress is saved automatically on the device, so closing the tab does not lose work.

## Key design decisions
- **One question per screen.** Reduces overwhelm, and makes validation, focus and announcements simple to do well.
- **Explain, don't just ask.** Every question carries a reason; official terms are defined where they appear.
- **Official wording is opt-in, not hidden.** Plain language leads, the legal text is one switch away, so nothing is lost for people who need to match the original form.
- **Never trap the user.** Missing documents become reminders, an income mismatch becomes a note, answers can be edited from review, and Cancel really restores the old value.
- **Monochrome, warm neutral palette** with a serif display face and a plain sans for body text. The single dark accent is reserved for the primary action and the "plain English" summary, so hierarchy comes from contrast and type rather than colour.
- **State is shown more than one way** (check marks, text and position, not colour alone).

## Accessibility: what was actually done and found

See `docs/AUDIT.md` for the full report. In short:

- **Built in:** semantic landmarks and headings, labelled controls, native radios/checkboxes/range inputs, skip link, focus moved to the new heading or input on every step with a live-region announcement, visible 3px focus outline, 44px minimum touch targets, text-size control, `prefers-reduced-motion` support, no colour-only state, inline errors announced with `role="alert"`, responsive down to 320px.
- **Automated:** axe-core (WCAG 2.0/2.1 A and AA plus best-practice rules) reported **0 violations across 28 runs** (14 screen states × desktop and phone widths) on the final build. A separate script measured text contrast on 7 screens with 0 failures.
- **Scripted keyboard test:** a mouse-free run from page load to receipt completes.
- **Found and fixed along the way:** 13 defects, including ones axe found (invalid list markup, a button whose name did not match its visible text) and ones it could not (a Cancel that kept edits, focus landing on the wrong element, resume going to the wrong screen).
- **Not done:** no testing with real screen readers, no real-device or non-Chromium browser testing, no testing with disabled users. **This is not a claim of WCAG conformance.**

## How it was built
- React 19, TypeScript, Vite, Tailwind CSS 4. No backend, no external fonts or network calls at runtime; state lives in `localStorage`.
- All content (questions, official wording, glossary, documents, timeline) is data in `src/data.ts`, so a different application process could be dropped in without changing the UI.
- Output is a single self-contained `index.html`.
- Testing: Playwright (Chromium) scripts for the journey, validation, persistence, edit and restart flows, plus axe-core, kept in `scripts/audit/`.
- **AI assistance:** this project was designed and implemented with AI assistance (Claude Code). The rules allow this; consider saying so plainly in your submission. [Add what you personally decided, reviewed or changed.]

## Challenges
- Making a comparison slider that is both striking and accessible led to replacing a pointer-only spotlight with a before/after slider that has a real keyboard-operable range input.
- Focus management: moving focus to headings helps screen-reader users but is annoying on question screens, so questions focus the field and announce the question through a live region instead.
- Keeping a popover inside the viewport at 320px with large text.

## Limitations (be upfront)
- **It is a prototype with a fictional program.** Nothing is submitted, no real agency or system is involved, and the eligibility rule, county and timeline are invented.
- No user testing and no measured outcomes. There are no usage, completion or impact figures.
- Accessibility is only partly verified (see above).
- Single flow, English only, no accounts, no file upload (documents are tracked as a checklist, not uploaded), data is only on the device.
- Display type depends on the fonts installed on the viewer's system.

## What's next
Real screen-reader and device testing; usability testing with people who find forms hard; multi-language support; a content editor so a team could author their own journey; file upload and an accessible save-and-return link.

## Built with
`react` `typescript` `vite` `tailwindcss` `accessibility` `a11y` `design` `claude-code`

## Links
- Live demo: [ADD ONLY A LINK YOU HAVE OPENED LOGGED OUT]
- Source: [ADD GITHUB URL]
- Video: [ADD YOUTUBE/VIMEO URL]

---

## Two-minute demo script (about 300 words)

Use sample data. Practice once so the timings hold.

**0:00 – 0:15 · Hook (welcome screen)**
"Forms like this are written for the institution, not for you. ClearForm rewrites the experience." Drag the slider: "Same rule. Official wording on the right, plain words on the left."

**0:15 – 0:35 · Quick check**
Click Start. "Three questions up front. If you're not eligible you find out now, and everything after is tailored to your answers." Choose "I'm behind on rent".

**0:35 – 0:50 · What to bring**
"Only the documents that apply to this situation." Mark two as ready, one as later. "'Later' is fine. It just goes on your receipt."

**0:50 – 1:25 · Questions**
Type a name; show Enter to continue. On the household question, click the underlined term: "Hard words are explained where they appear." Click "Why are you asking?" Flip "Official wording": "The legal text is one switch away if you need to match the original." Enter a bad email, show the friendly message. Mention text size control.

**1:25 – 1:45 · Review**
"It opens with what we understood, in plain English." Click Change on rent, edit, save: "back to review in one tap." Briefly show the income note.

**1:45 – 2:00 · Receipt and close**
Send. "A reference number, dated next steps, and what's still to bring." Press Back/reload to show saved progress. Close: "ClearForm: government forms, finally in plain words. A design prototype, tested with axe and keyboard scripts. Real screen-reader testing is the next step."

---

## Screenshot checklist

Draft captures from the local build (sample data, Linux fallback fonts) are in `docs/screenshots/`. For the Devpost gallery, re-capture on your own machine so display fonts render as intended, and use the live build.

Required (desktop, about 1440×900):
- [ ] `01` Welcome with the slider mid-way (hero image for Devpost)
- [ ] `02` Quick check with answers selected
- [ ] `03` What to bring with a mix of "I have it" / "later"
- [ ] `04` A question with the glossary popover open
- [ ] `05` A question with "Official wording" on and "Why are you asking?" open
- [ ] `06` A friendly validation message
- [ ] `07` Review screen with the plain-English summary
- [ ] `08` Receipt with the timeline

Recommended:
- [ ] Phone width (390px): welcome, a question, receipt
- [ ] Large text size (+3) on a question screen, to show it holds up
- [ ] A keyboard focus ring visible on a control
- [ ] Optional: the axe result summary (screenshot of `docs/AUDIT.md`, or run the scripts yourself)
