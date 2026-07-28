import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = process.env.SEED_EMAIL ?? "admin@mannaflow.ca";
const password = process.env.SEED_PASSWORD ?? "changeme123";
const organizationName = process.env.SEED_ORGANIZATION ?? "MannaFlow Internal";
const role = process.env.SEED_ROLE ?? "INTERNAL_ADMIN";

const hash = await bcrypt.hash(password, 12);
const organization = await prisma.contractorOrganization.upsert({
  where: { name: organizationName },
  update: {},
  create: { name: organizationName },
});

const user = await prisma.contractorTechUser.upsert({
  where: { email },
  update: { password: hash, organizationId: organization.id, role },
  create: { email, password: hash, organizationId: organization.id, role },
});

console.log(`✅ ContractorTechUser created: ${user.email}`);
console.log(`   Login password: ${password}`);
console.log(`   Change this after first login.`);

await prisma.$disconnect();
