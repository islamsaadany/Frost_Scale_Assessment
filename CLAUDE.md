# Claude Code Instructions for مقياس فروست (Frost Scale)

> Read at the start of each session. Project-specific rules and guidelines.
> Technical reference lives in `PROJECT_DETAILS.md`; the methodology lives in
> `docs/FROST_SCALE_SPEC.md`.

---

## Working Guidelines

### 1. Align before acting
- **Do not implement features or significant changes without confirming the plan.**
- If uncertain about requirements, **ask** — don't assume.
- If there are multiple approaches, present them as options with a clear recommendation.

### 1b. UI changes require explicit approval
- **Never change UI design, layout, spacing, colors, labels, or section order unless it was asked for.**
- If a bug fix needs a visual change, describe the change and get approval first.
- When restoring a design, match it **exactly** — don't "improve" it.
- This project's owner reviews visuals closely (see the git history: many rounds
  were pure layout/color refinements). Ship exactly what was requested.

### 1c. Language & content fidelity
- **All user-facing text is Arabic (RTL).** Keep it Arabic; keep RTL correct.
- The questionnaire content, dimension labels, band labels, and scoring notes are
  **verbatim from the booklet** — do not paraphrase or invent narrative. If new
  interpretive text is ever needed, get it from the author, not generated.

### 2. Think before acting
- Analyze requests; challenge anything that seems wrong or risky before doing it.
- Consider downstream effects (scoring correctness, print/PDF, RTL, responsive).

### 3. Quality assurance
- **Always verify the build:** `npx tsc --noEmit` and `npm run build`.
- Don't leave TypeScript errors. Handle nulls/empty states (a session may have no
  responses yet; scores may be null before submit).
- Prefer verifying real behavior: the flow is code → take 35 Q → report. When a
  DB is available, drive it end-to-end (see PROJECT_DETAILS “Local testing”).

### 3b. Engineering preferences
- **DRY:** extract logic repeated 3+ times; flag repetition of 2.
- **Explicit over clever.** Readable beats compact.
- **Engineered enough** — not fragile, not over-abstracted. When unsure, ask.
- Fixed content (questions, thresholds, copy) belongs in `src/data/*`, never the DB.

### 4. Git workflow
- Two branches in active use:
  1. `main` — production/stable (Vercel deploys this).
  2. Session branch `claude/<task>-<sessionId>` — all development.
- Commit to the session branch with descriptive messages; open a PR to `main` and
  merge when verified. **`main` is the deploy target** — the app is only live once
  changes reach `main`.
- If the session PR is already merged, restart the branch from the latest `main`
  for follow-up work (don't stack on merged history).

### 5. Communication
- Flag concerns early; explain the rationale for changes; ask rather than assume.

---

## Project Context

### What this app is
An Arabic (RTL) web app for the **Frost Multidimensional Perfectionism Scale
(مقياس فروست)** by Dr. Emad Rashad Othman. A respondent enters an access code,
answers **35 Likert statements** one at a time, and gets an **individual report**
across **7 dimensions** with per-dimension band scoring, a spider chart, and a
total "general perfectionism" score. An admin issues access codes and views
submissions. No cohort aggregation; no AI.

### Technology stack
- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript 5.9
- **Database:** PostgreSQL + Prisma 5.22
- **Styling:** **Tailwind CSS 3**, RTL, Arabic (Tajawal via `next/font`). The Frost
  palette lives in `tailwind.config.ts` and hex tokens in `src/data/constants.ts`.
- **Auth:** lightweight HMAC-signed cookie (no external provider). Admin login is
  **password-only** (matched against active admins).
- **Reports:** rendered in-app; “save PDF” = browser print (no PDF library).
- **Deployment:** Vercel. See `docs/DEPLOYMENT.md`.

### Repository
- **GitHub:** `islamsaadany/Frost_Scale_Assessment`
- **Production:** Vercel (env: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`).

### The most important rule
The **scoring must stay faithful** to `docs/FROST_SCALE_SPEC.md`. Questions,
dimension → item mapping, and band thresholds are the source of truth in
`src/data/questions.ts` and `src/data/dimensions.ts`. Two booklet typos are
corrected there and documented in the spec (duplicate item 29; dimension-6 bands).

---

## Common commands
```bash
npm install
npx prisma db push          # create tables (needs DATABASE_URL)
npm run seed                # seed admin + demo code FROST1
npm run dev                 # http://localhost:3000
npx tsc --noEmit            # typecheck
npm run build               # prisma generate && next build
```

## Gotchas
- **RTL:** numbers/codes/dates use the `.ltr-nums` helper so digits render L→R.
  Inside RTL tables, keep number cells `text-right` so they align under headers.
- **Scores are frozen at submit** onto `Session.dimensionScores/totalScore/totalBand`;
  the report falls back to recomputing from raw responses if those are absent.
- **Report colors** come from a palette map threaded into `SpiderChart`/`BandBar`
  (`src/data/constants.ts → BAND_PALETTES`); the report uses the green→red scheme.
- **Spider labels** are placed outside the grid with size-adaptive margins — keep
  them outside even when a dimension maxes out (vertex on the outer ring).
- Don't hardcode the model identifier or secrets anywhere in the repo.
