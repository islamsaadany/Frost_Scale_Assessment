# مقياس فروست — Frost Scale Assessment

An Arabic (RTL) web app for the **Frost Multidimensional Perfectionism
Scale (مقياس فروست)**: a code-gated, one-question-at-a-time questionnaire
that produces an **individual** report across seven dimensions of
perfectionism.

The product concept borrows from two sibling tools in this account:
- the **admin + one-question-at-a-time** flow from _Corporate Endurance
  Assessment_, and
- the **per-respondent individual report** pattern from _Strategic
  Thinking Profile_.

See [`docs/FROST_SCALE_SPEC.md`](./docs/FROST_SCALE_SPEC.md) for the
methodology, dimensions, and scoring bands.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 3 (custom Frost palette, RTL)
- Prisma 5 · PostgreSQL
- Lightweight HMAC cookie auth for the admin surface (no external provider)

## Getting started

```bash
npm install

# 1. Configure the database + secrets
cp .env.example .env
#   set DATABASE_URL / DATABASE_URL_UNPOOLED and AUTH_SECRET

# 2. Create the schema and seed an admin + demo access code
npx prisma db push
npm run seed          # uses SEED_ADMIN_* from .env

# 3. Run
npm run dev
```

- Respondent flow: `/` → enter access code → welcome → demographics →
  35 questions → report.
- Admin: `/admin` (login with the seeded credentials) → issue access
  codes, view submissions, open any individual report.

The seed creates a demo access code **`FROST1`** so you can walk the take
flow immediately.

## Project structure

```
src/
  app/
    page.tsx                 access-code entry (landing)
    take/                    welcome · demographics · question/[n] · done
    report/[sessionId]/      individual report (server) + spider chart
    admin/                   login · dashboard (codes + submissions)
    api/                     access-codes · sessions · admin
  components/                BrandMark · SpiderChart · PrintButton
  data/                      questions · dimensions · constants · report-content
  lib/                       prisma · scoring · report · auth · code · take-storage
prisma/                      schema.prisma · seed.ts
docs/                        FROST_SCALE_SPEC.md
```

## Notes

- All questionnaire content, band thresholds, and report copy are **fixed
  data** in `src/data/*` — not stored in the database. The DB holds only
  admins, access codes, respondent sessions, and raw answers.
- The report is **educational, not diagnostic**; a disclaimer is always
  shown.
- Two typos in the source booklet are corrected in code and documented in
  the spec (duplicate item 29; dimension-6 band thresholds).
