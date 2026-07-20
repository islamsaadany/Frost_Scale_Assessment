import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "change-me";
  const name = process.env.SEED_ADMIN_NAME ?? "مسؤول النظام";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name },
  });

  // A demo access code so the take-flow can be exercised immediately.
  await prisma.accessCode.upsert({
    where: { code: "FROST1" },
    update: {},
    create: {
      code: "FROST1",
      description: "رمز تجريبي",
      maxUses: 100,
    },
  });

  console.log(`Seeded admin <${email}> and demo access code FROST1.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
