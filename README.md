# ClearForm

A plain-language, one-question-at-a-time application journey. Built as a design prototype for the Hyperbloom October 2026 UI/UX & Web Design hackathon.

The demo walks through a **fictional** program, "Riverside Rent Relief". Nothing is submitted anywhere: all data stays in the browser (`localStorage`), and there is no backend.

## Run it

```bash
npm install
npm run dev          # local dev server
npm run build        # type-check + production build into dist/ (a single self-contained index.html)
npm run preview      # serve the production build
```

Node 22 was used. No environment variables or external services are needed.

## Stack

React 19 · Vite 8 · TypeScript 6 · Tailwind CSS 4 · `vite-plugin-singlefile` (inlines JS and CSS so `dist/index.html` is deployable anywhere). System font stacks only, so no font requests.

## Structure

```
src/data.ts        questions, official wording, glossary, documents, timeline (all content lives here)
src/lib.ts         validation, summary text, formatting
src/state.ts       journey state + localStorage persistence
src/App.tsx        shell: header, step progress, focus management, live announcements
src/ui.tsx         shared components (glossary terms, comparison slider, buttons)
src/fields.tsx     accessible choice cards and text fields
src/screens/       Welcome, Triage, Out, Docs, Ask, Review, Done
scripts/audit/     the Playwright + axe-core scripts used for verification (see docs/AUDIT.md)
docs/              audit report, submission text, screenshots
```

## Deploy

The build output is one static file, so any static host works.

- **GitHub Pages**: `.github/workflows/pages.yml` is included but has **not been run yet**. In the repo go to Settings → Pages → Source: "GitHub Actions", then push to `main`.
- **Netlify / Vercel / Cloudflare Pages**: build command `npm run build`, publish directory `dist`.
- **Any host**: upload `dist/index.html` and `dist/favicon.svg`.

## Verification

See [docs/AUDIT.md](docs/AUDIT.md) for exactly what was tested automatically, what was checked by script-driven keyboard testing, and what has **not** been tested.

## Notes on the content

The program, county, agency, eligibility rule (an income limit of $3,200 plus $900 per additional household member per month) and timeline are invented for the demo. They do not reflect any real program.
