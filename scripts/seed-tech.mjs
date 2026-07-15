import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = process.env.SEED_EMAIL ?? "admin@mannaflow.ca";
const password = process.env.SEED_PASSWORD ?? "changeme123";

const hash = await bcrypt.hash(password, 12);

const user = await prisma.hvacTechUser.upsert({
  where: { email },
  update: { password: hash },
  create: { email, password: hash },
});

console.log(`✅ HvacTechUser created: ${user.email}`);
console.log(`   Login password: ${password}`);
console.log(`   Change this after first login.`);

await prisma.$disconnect();
