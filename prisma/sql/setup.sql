-- ============================================================
--  مقياس فروست (Frost Scale) — one-time database setup
--  Run this once in your Postgres SQL editor (Neon / Vercel
--  Postgres). It is the SQL equivalent of `prisma db push`.
--
--  For the admin row, generate a bcrypt hash of your chosen
--  password and paste it below (see the note in section 4), or
--  just run `npm run seed` instead of the INSERTs.
-- ============================================================

-- 1) Tables ---------------------------------------------------
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccessCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccessCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "accessCodeId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "gender" TEXT,
    "ageBand" TEXT,
    "occupation" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "dimensionScores" JSONB,
    "totalScore" INTEGER,
    "totalBand" TEXT,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- 2) Indexes --------------------------------------------------
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX "AccessCode_code_key" ON "AccessCode"("code");
CREATE INDEX "AccessCode_code_idx" ON "AccessCode"("code");
CREATE INDEX "AccessCode_isActive_idx" ON "AccessCode"("isActive");
CREATE INDEX "Session_accessCodeId_idx" ON "Session"("accessCodeId");
CREATE INDEX "Session_submittedAt_idx" ON "Session"("submittedAt");
CREATE INDEX "Response_sessionId_idx" ON "Response"("sessionId");
CREATE UNIQUE INDEX "Response_sessionId_questionId_key" ON "Response"("sessionId", "questionId");

-- 3) Foreign keys ---------------------------------------------
ALTER TABLE "Session" ADD CONSTRAINT "Session_accessCodeId_fkey"
    FOREIGN KEY ("accessCodeId") REFERENCES "AccessCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Response" ADD CONSTRAINT "Response_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4) Seed (optional — or run `npm run seed`) ------------------
-- Generate a bcrypt hash for your password, e.g.:
--   node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD',10))"
-- then replace <BCRYPT_HASH> below.
--
-- INSERT INTO "Admin" ("id","email","passwordHash","name","isActive","updatedAt")
-- VALUES (gen_random_uuid()::text, 'admin@example.com', '<BCRYPT_HASH>',
--         'مسؤول النظام', true, now());

-- Demo access code (delete after testing):
INSERT INTO "AccessCode" ("id","code","description","maxUses")
VALUES (gen_random_uuid()::text, 'FROST1', 'رمز تجريبي', 100);
