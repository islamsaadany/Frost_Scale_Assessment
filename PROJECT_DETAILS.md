# PROJECT_DETAILS — مقياس فروست (Frost Scale)

Technical reference for the app. Pair this with:
- `docs/FROST_SCALE_SPEC.md` — the instrument (dimensions, items, band thresholds).
- `docs/DEPLOYMENT.md` — Vercel + Postgres setup.
- `CLAUDE.md` — working guidelines.

---

## 1. What it is

An Arabic (RTL) web app implementing the **Frost Multidimensional Perfectionism
Scale** (35 Likert items, 7 dimensions). Access-code gated; produces an
**individual** report per respondent (no cohort aggregation, no AI).

Flow: `/` (enter code) → welcome → demographics → 35 questions → done → report.
Admin at `/admin` issues codes and views submissions.

## 2. Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 16 (App Router), React 19, TypeScript 5.9 |
| DB / ORM | PostgreSQL + Prisma 5.22 |
| Styling | Tailwind CSS 3, RTL, Arabic (Tajawal via `next/font/google`) |
| Auth | HMAC-signed cookie (custom, `src/lib/auth.ts`); admin login is password-only |
| Passwords | `bcryptjs` |
| Charts | Hand-rolled SVG radar (`src/components/SpiderChart.tsx`) — no chart lib |
| PDF | Browser print (`window.print()`), no PDF library |
| Deploy | Vercel |

## 3. Directory layout

```
src/
  app/
    layout.tsx                 RTL <html dir=rtl>, Tajawal font
    globals.css                Tailwind + component classes (.card/.btn-*/.field)
    page.tsx                   landing / access-code entry (dark cover) + admin link
    take/
      layout.tsx               header (PageHeader)
      welcome/                 intro + Likert legend
      demographics/            name (required) + optional fields
      question/[n]/
        page.tsx               server: resolves question, renders card
        question-card.tsx      client: one-question flow, cache, submit
      done/                    thank-you → link to report
    report/[sessionId]/
      page.tsx                 server: fetch + buildReport, renders ReportView
      report-view.tsx          client: dashboard layout (hero + spider + list)
    admin/
      login/                   password-only login
      page.tsx                 server auth guard → AdminClient
      admin-client.tsx         client: access codes + submissions tables
      settings/                change password · manage admins
    api/                       see §6
  components/
    BrandMark.tsx              Logo, Wordmark, PageHeader
    SpiderChart.tsx            SVG radar; band-colored vertices; labels outside grid
    BandBar.tsx                4-segment band bar (كيفية التصحيح style)
    DimensionPill.tsx          orange section pill (Arabic + English)
    SectionRail.tsx            active pill + numbered dots (take-flow progress)
    PrintButton.tsx
  data/                        FIXED CONTENT (not in DB) — see §4
  lib/                         prisma · scoring · report · auth · code · take-storage
prisma/
  schema.prisma                see §5
  seed.ts                      seeds admin (SEED_ADMIN_*) + demo code FROST1
  sql/setup.sql                SQL-editor equivalent of db push + demo code
public/
  frost-logo.png               author's emblem (extracted from booklet)
  cover-cube.jpg               cover artwork (landing hero)
docs/                          FROST_SCALE_SPEC.md · DEPLOYMENT.md
```

## 4. Fixed-content architecture (`src/data`)

All questionnaire content and scoring rules are static TypeScript — **never** in
the DB — so the DB holds only operational data.

- `questions.ts` — the 35 items (`{id, dimension, text}`) + `questionAtPosition`.
- `dimensions.ts` — 7 `Dimension`s (`itemIds`, `min/max`, `bands[]`), `BANDS`,
  `BAND_ORDER`, total-scale bands, `bandForRaw()`.
- `constants.ts` — Likert options, titles, `BAND_HEX`, `BAND_PALETTES`
  (`warm`/`severity`), `textOn()`.
- `report-content.ts` — `TOTAL_LABEL` and the booklet's scoring notes (kept for
  reference; the report currently shows scores/bands, not narrative).

## 5. Data model (`prisma/schema.prisma`)

- **Admin** — `id, email (unique), passwordHash, name, isActive`.
- **AccessCode** — `code (unique, 6 chars, uppercased), description, maxUses,
  currentUses, expiresAt?, isActive`.
- **Session** — respondent: optional `name/email/gender/ageBand/occupation`,
  `accessCodeId?`, `startedAt`, `submittedAt?`, and frozen scores
  `dimensionScores(Json) / totalScore / totalBand`.
- **Response** — `sessionId, questionId (1..35), value (1..5)`, unique per
  `(sessionId, questionId)`.

`generator client` pins `binaryTargets = ["native", "rhel-openssl-3.0.x"]` for
Vercel's serverless runtime. `datasource` uses `DATABASE_URL` (pooled) +
`directUrl = DATABASE_URL_UNPOOLED` (migrations/db push).

## 6. API routes (`src/app/api`)

Respondent (public):
- `POST /access-codes/validate` — `{code}` → validates, opens a `Session`
  (atomic `currentUses` bump), returns `{sessionId}`.
- `GET  /sessions/[id]` — status + answers-so-far (resume).
- `POST /sessions/[id]/demographics` — save name (+ optional fields).
- `PATCH /sessions/[id]/responses` — upsert answers (idempotent).
- `POST /sessions/[id]/submit` — requires all 35 answered; computes + freezes
  scores; stamps `submittedAt`.

Admin (cookie-guarded via `getAdminId()`):
- `POST /admin/login` — `{password}` matched against any active admin (bcrypt).
- `POST /admin/logout`
- `GET/POST /admin/access-codes` · `PATCH /admin/access-codes/[id]`
- `GET /admin/sessions` — submitted sessions list.
- `POST /admin/account/password` — change own password.
- `GET/POST /admin/admins` · `PATCH/DELETE /admin/admins/[id]`.

## 7. Scoring (`src/lib/scoring.ts`, `src/lib/report.ts`)

- `computeScores(answers)` sums each dimension's item values → band via
  `bandForRaw`, and the total (35 items) → total band. Returns per-dimension
  `{raw, band, fraction}` (fraction = position within `[min,max]` for charts).
- Scores are computed on **submit** and stored on the `Session`.
- `buildReport(session)` prefers frozen scores; **recomputes from raw responses**
  if they're missing. Returns `ReportData` consumed by `ReportView`.

## 8. Report (`report-view.tsx`)

Dashboard layout, `max-w-5xl`:
1. Total hero — big score + band chip + 4-segment total `BandBar`.
2. Profile — responsive grid: **spider on the right (md+) / on top (mobile)** +
   compact dimension list (number · name · position bar · chip · score) on the left.
- Colors: green→red severity palette (`BAND_PALETTES.severity`), threaded into
  `SpiderChart`/`BandBar`; chip text auto-contrasts via `textOn()`.
- Spider labels are pushed outside the grid with size-adaptive margins.

## 9. Take flow (`question-card.tsx`)

- Session id + answers cached in `localStorage` (`src/lib/take-storage.ts`) so the
  flow resumes across refreshes; answers saved in background + flushed on submit.
- Keyboard 1–5 selects; auto-advances; last question submits.
- `SectionRail` shows the 7 dimensions (active pill + numbered dots).
- Question text sits in a **fixed-height, centered** box so the rating row never
  shifts between short and long questions.

## 10. Auth (`src/lib/auth.ts`)

HMAC-SHA256 signed, expiring cookie (`frost_admin_session`, 8h) using
`AUTH_SECRET`. `getAdminId()` reads/verifies it. Login is password-only:
`/api/admin/login` bcrypt-compares the password against every active admin.

## 11. Local testing (no cloud DB needed)

Postgres binaries exist in this environment. Run an unprivileged temp cluster:
```bash
useradd -m pg 2>/dev/null; PGBIN=/usr/lib/postgresql/16/bin
mkdir -p /tmp/pgdata /tmp/pgrun; chown -R pg /tmp/pgdata /tmp/pgrun
runuser -u pg -- $PGBIN/initdb -D /tmp/pgdata -U postgres --auth=trust
runuser -u pg -- $PGBIN/pg_ctl -D /tmp/pgdata -o "-p 5433 -k /tmp/pgrun" -l /tmp/pglog.log start
runuser -u pg -- $PGBIN/psql -h /tmp/pgrun -p 5433 -U postgres -c "CREATE DATABASE frost;"
export DATABASE_URL="postgresql://postgres@localhost:5433/frost" DATABASE_URL_UNPOOLED="$DATABASE_URL" AUTH_SECRET=localtest
npx prisma db push && npm run seed && npm run build && npx next start
```
Chromium (Playwright) is preinstalled at `/opt/pw-browsers` for screenshotting.

## 12. Decisions & their rationale

- **Fixed content in `src/data`, not DB** — the instrument is authoritative and
  versioned in code; the DB is purely operational.
- **Password-only admin login** — requested for simplicity; matched against DB
  admins so passwords can still be rotated from `/admin/settings`.
- **Green→red report palette** — chosen as the sole scheme for an intuitive
  low→high read (was briefly a toggle with the warm palette).
- **Spider drawn by hand (SVG)** — avoids a chart dependency and gives full control
  over RTL labels and band coloring.
- **Booklet corrections** — item 29 de-duplicated (35 unique items); dimension-6
  high/severe thresholds corrected. Both documented in `docs/FROST_SCALE_SPEC.md`.
