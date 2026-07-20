# Deploying to Vercel

The app is a standard Next.js 16 project — Vercel auto-detects it. The only
real work is provisioning a Postgres database and pushing the schema once.

## 1. Provision a Postgres database

Use **Vercel Postgres** (Storage tab → Create → Postgres) or **Neon**. Either
gives you two connection strings:

- a **pooled** URL (safe for serverless) → maps to `DATABASE_URL`
- a **direct / non-pooling** URL → maps to `DATABASE_URL_UNPOOLED`

| Provider | Pooled → `DATABASE_URL` | Direct → `DATABASE_URL_UNPOOLED` |
|----------|-------------------------|----------------------------------|
| Vercel Postgres | `POSTGRES_PRISMA_URL` | `POSTGRES_URL_NON_POOLING` |
| Neon | `DATABASE_URL` | `DATABASE_URL_UNPOOLED` |

## 2. Set environment variables (Vercel → Settings → Environment Variables)

Required at runtime:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | pooled connection string |
| `DATABASE_URL_UNPOOLED` | direct connection string |
| `AUTH_SECRET` | random secret — `openssl rand -base64 32` |

`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` are only needed
for the one-time seed in step 3, not at runtime.

## 3. Create the schema + seed the admin (one-time)

The build does **not** touch the database, so push the schema and seed the
admin account once, from your machine, pointed at the **production** DB:

```bash
# use the DIRECT (unpooled) URL for schema push
export DATABASE_URL="<direct-url>"
export DATABASE_URL_UNPOOLED="<direct-url>"

npx prisma db push        # creates the tables

export SEED_ADMIN_EMAIL="you@example.com"
export SEED_ADMIN_PASSWORD="a-strong-password"
export SEED_ADMIN_NAME="اسمك"
npm run seed              # creates the admin + demo access code FROST1
```

You can re-run `prisma db push` any time the schema changes.

## 4. Deploy

Import the repo in Vercel (or `vercel --prod`). The build command is already
`prisma generate && next build`, and `postinstall` regenerates the Prisma
client on every build. No other configuration is needed:

- API route handlers run on the **Node.js** runtime (required — admin auth
  uses `crypto`); nothing forces the Edge runtime, so this is automatic.
- The Prisma client ships the `rhel-openssl-3.0.x` engine that matches
  Vercel's serverless runtime (see `prisma/schema.prisma`).
- Images (`/frost-logo.png`, `/cover-cube.jpg`) are served from `public/`.

## 5. After the first deploy

1. Visit `/admin`, log in with the seeded credentials.
2. Create real access codes for your respondents.
3. Disable or delete the demo code **FROST1**.

## Notes

- No secrets are committed; `.env` is gitignored. Set everything in Vercel.
- Respondent flow: `/` → code → welcome → demographics → 35 questions →
  report. Admin: `/admin`.
