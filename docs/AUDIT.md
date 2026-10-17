# Verification and accessibility audit

Run against the production build served locally (`vite preview`), headless Chromium via Playwright, October 2026. Scripts are in `scripts/audit/`. This is **not** a WCAG conformance claim.

## 1. Automated results

| Check | Scope | Result |
|---|---|---|
| axe-core (tags: wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice) | 14 screen/state combinations × 2 viewports (1366px, 390px) = 28 runs, including an open glossary popover, official-wording mode, text and choice questions, review, receipt | **0 violations** in the final build. 38–45 rules passed per run. |
| axe "needs review" items | `color-contrast` flagged as incomplete in 10 of 28 runs | axe could not decide automatically, so these were **not** counted as passes. See the contrast scan below. |
| Custom contrast scan | Every visible text element on 7 screens at 1366px, computed foreground vs. effective background | 0 text elements below 4.5:1 (3:1 for large text). Not covered: hover/focus colour states, text over the animated hero slider mid-drag. |
| Scripted functional checks | 56 assertions (below) | **56 / 56 pass** |
| Console / page errors | Whole run | None |

### Defects found and fixed during this pass
1. "Continue where you left off" always returned to the first screen instead of the saved position.
2. **Cancel** in the edit-from-review flow kept the half-edited (even invalid) answer.
3. After pressing Continue, focus jumped to the heading instead of the input, so keyboard users had to Tab to the field.
4. Review sections used `aria-labelledby` values containing spaces (referenced several non-existent ids).
5. Review list markup was invalid (`dt`/`dd` with a button inside a `div` in a `dl`): 28 axe nodes.
6. A−/A+ buttons: accessible name did not match visible text (axe `label-content-name-mismatch`).
7. Horizontal overflow at 320px, and at 390px with the largest text size (header and step bar).
8. Control borders and radio indicators were about 1.9:1; raised to at least 3.3:1.
9. Placeholder text was about 1.9:1; raised to about 5.9:1.
10. Date-of-birth check was time-zone sensitive; household size accepted decimals.
11. Smooth scrolling ignored `prefers-reduced-motion`.
12. `aria-label` on a non-interactive paragraph (receipt reference).
13. Glossary popover could extend past the viewport edge on narrow screens.

## 2. Scripted manual-style checks (keyboard and behaviour)

- Keyboard-only run from page load to receipt, no mouse: skip link is first tab stop and moves focus to `main`; radios operable with Space and arrow keys; Enter advances; focus lands on the new heading on screen changes and on the input on question changes; a 3px outline is present on focused controls.
- Glossary terms open with Enter and close with Escape.
- Validation messages for: empty required, short name, under 18, future date, 18th birthday not yet reached, malformed email, non-integer / zero / too-large household size, non-numeric money fields.
- Persistence: reload on a question restores the screen and the typed value; logo → welcome → Continue returns to the same question; receipt survives reload.
- Edit flow: Change → edit → Save returns to review with updated values and updated summary; Cancel restores the previous value.
- Start over: inline two-step confirmation (the artifact frame disables `confirm()`); Keep it cancels; Yes erases storage and returns to welcome.
- Branches: "I'm moving" swaps rent/owed questions for a deposit question and swaps required documents; outside-county and under-18 exit paths.
- `prefers-reduced-motion: reduce` emulated: animation durations collapse and the hero slider skips its intro animation.
- No horizontal overflow at 320, 390, 768 and 1366px at the smallest and largest in-app text sizes.

## 3. Not tested (do not claim)

- **No real screen reader testing** (NVDA, JAWS, VoiceOver, TalkBack). Semantics, labels and live-region announcements were reviewed in code and by axe only.
- No testing on real phones or tablets, Safari, Firefox or Edge. Chromium only.
- No testing with users, including disabled users. No user research was done.
- No text-spacing override (WCAG 1.4.12), forced-colors / Windows High Contrast, or browser zoom beyond the in-app text size control and narrow viewports.
- Contrast of hover, active and disabled states was not measured.
- Content readability was not measured with any reading-level tool; the plain-language rewrite is the author's judgement.
- Not checked: `<html lang>` and the document title when hosted inside a Claude Artifact frame (the host controls the page skeleton). The standalone build sets `lang="en"`.

## 4. Known limitations
- The question heading and the input's visually-hidden label repeat the same text, so a screen reader may announce the question twice.
- The hero comparison slider cuts both texts mid-line by design; the plain-language text is the readable one, and the official text there is decorative (`aria-hidden`).
- The header is sticky from 640px up; on phones it scrolls away to save space.
- Fonts are system stacks (Iowan Old Style / Palatino / Georgia for display), so display type looks different per operating system.
