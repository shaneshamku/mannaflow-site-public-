// One-command local dev seed: tech account + campaigns + realistic sample
// leads/activity/chat data so the dashboard (Overview, Leads, Campaigns,
// Analytics) has something to show on a fresh checkout. Safe to re-run —
// every write is an upsert keyed by a unique field (email/path/phone).
//
// Usage: npm run db:seed
// Runs scripts/seed-tech.mjs and scripts/seed-campaigns.mjs as separate
// processes (reusing their existing logic/content) via spawnSync, so there's
// one source of truth for the tech-account and campaign-template shapes.

import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCAL_EMAIL = "dev@local.test";
const LOCAL_PASSWORD = "localdev123";

// North American fictional number range (555-0100..555-0199) — guaranteed
// non-routable, so nothing accidentally texts a real person even if Twilio
// credentials happen to be set locally.
const phone = (n) => `+1555010${String(n).padStart(2, "0")}`;

function run(cmd, args, extraEnv = {}) {
  const res = spawnSync(cmd, args, {
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (res.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed (exit ${res.status})`);
}

const now = new Date();
const thisMonth = new Date(now.getFullYear(), now.getMonth(), 5);
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 12);

const SAMPLE_LEADS = [
  {
    n: 1,
    name: "Alicia Chen",
    leadSource: "Missed Call",
    serviceType: "REPAIR",
    urgencyLevel: "EMERGENCY",
    issueDescription: "No heat, furnace making a loud banging noise",
    currentStage: "NEW_LEAD",
    createdAt: thisMonth,
  },
  {
    n: 2,
    name: "Marcus Odom",
    leadSource: "Website Form",
    serviceType: "MAINTENANCE",
    urgencyLevel: "ROUTINE",
    issueDescription: "Annual furnace tune-up",
    currentStage: "NEW_LEAD",
    createdAt: thisMonth,
  },
  {
    n: 3,
    name: "Priya Nair",
    leadSource: "Referral",
    serviceType: "REPAIR",
    urgencyLevel: "URGENT",
    issueDescription: "AC not cooling, warm air only",
    currentStage: "CONTACTED",
    createdAt: thisMonth,
  },
  {
    n: 4,
    name: "Devon Walsh",
    leadSource: "Google Ads",
    serviceType: "INSTALLATION",
    urgencyLevel: "ROUTINE",
    issueDescription: "Quote for new central AC install",
    currentStage: "CONTACTED",
    createdAt: lastMonth,
  },
  {
    n: 5,
    name: "Grace Okafor",
    leadSource: "Website Form",
    serviceType: "INSTALLATION",
    urgencyLevel: "ROUTINE",
    issueDescription: "Replacing a 15-year-old furnace",
    currentStage: "QUOTE_SENT",
    createdAt: lastMonth,
  },
  {
    n: 6,
    name: "Tomás Rivera",
    leadSource: "Facebook",
    serviceType: "REPAIR",
    urgencyLevel: "URGENT",
    issueDescription: "Thermostat unresponsive, no display",
    currentStage: "QUOTE_SENT",
    createdAt: thisMonth,
  },
  {
    n: 7,
    name: "Sana Farooqi",
    leadSource: "Referral",
    serviceType: "MAINTENANCE",
    urgencyLevel: "ROUTINE",
    issueDescription: "Duct cleaning + filter replacement",
    currentStage: "JOB_BOOKED",
    createdAt: lastMonth,
  },
  {
    n: 8,
    name: "Owen Kaczmarek",
    leadSource: "Missed Call",
    serviceType: "REPAIR",
    urgencyLevel: "ROUTINE",
    issueDescription: "Water heater pilot light won't stay lit",
    currentStage: "JOB_COMPLETE",
    createdAt: lastMonth,
  },
  {
    n: 9,
    name: "Renée Bouchard",
    leadSource: "Website Form",
    serviceType: "INSTALLATION",
    urgencyLevel: "ROUTINE",
    issueDescription: "New heat pump install, 2-story house",
    currentStage: "INVOICE_SENT",
    createdAt: lastMonth,
  },
  {
    n: 10,
    name: "Ben Iwu",
    leadSource: "Referral",
    serviceType: "MAINTENANCE",
    urgencyLevel: "ROUTINE",
    issueDescription: "Spring AC tune-up before summer",
    currentStage: "PAID",
    createdAt: lastMonth,
    dateEnteredStage: thisMonth,
  },
];

async function seedLeads() {
  const leads = [];
  for (const l of SAMPLE_LEADS) {
    const lead = await prisma.hvacLead.upsert({
      where: { phone: phone(l.n) },
      update: {},
      create: {
        phone: phone(l.n),
        name: l.name,
        leadSource: l.leadSource,
        serviceType: l.serviceType,
        urgencyLevel: l.urgencyLevel,
        issueDescription: l.issueDescription,
        currentStage: l.currentStage,
        createdAt: l.createdAt,
        dateEnteredStage: l.dateEnteredStage ?? l.createdAt,
      },
    });
    leads.push(lead);

    const existingActivity = await prisma.hvacActivityLog.count({ where: { leadId: lead.id } });
    if (existingActivity === 0) {
      await prisma.hvacActivityLog.createMany({
        data: [
          {
            leadId: lead.id,
            type: "CALL",
            direction: "INBOUND",
            content: "Missed call — auto-SMS sent",
            timestamp: l.createdAt,
          },
          {
            leadId: lead.id,
            type: "STAGE_CHANGE",
            content: `Moved to ${l.currentStage.replaceAll("_", " ")}`,
            timestamp: l.dateEnteredStage ?? l.createdAt,
          },
        ],
      });
    }
  }
  return leads;
}

async function seedChatTranscript(lead) {
  const existing = await prisma.hvacChatMessage.count({ where: { leadId: lead.id } });
  if (existing > 0) return;

  await prisma.hvacChatMessage.createMany({
    data: [
      { leadId: lead.id, role: "ASSISTANT", content: "Hi, thanks for calling MannaFlow HVAC! We missed your call — what's going on with your system?" },
      { leadId: lead.id, role: "USER", content: lead.issueDescription ?? "My furnace stopped working." },
      { leadId: lead.id, role: "ASSISTANT", content: "Got it — sorry to hear that. Can I grab your name and address so we can get a tech out?" },
      { leadId: lead.id, role: "USER", content: `${lead.name}, thanks for the quick reply.` },
    ],
  });
}

async function seedCampaignEnrollments(leads) {
  const [pathA, pathB] = await Promise.all([
    prisma.hvacCampaign.findFirst({ where: { path: "A" } }),
    prisma.hvacCampaign.findFirst({ where: { path: "B" } }),
  ]);
  if (!pathA || !pathB) return;

  const byName = (name) => leads.find((l) => l.name === name);

  const enrollments = [
    { campaignId: pathA.id, lead: byName("Alicia Chen"), lastStepIndexSent: 0, status: "ACTIVE" },
    { campaignId: pathA.id, lead: byName("Marcus Odom"), lastStepIndexSent: -1, status: "ACTIVE" },
    { campaignId: pathB.id, lead: byName("Priya Nair"), lastStepIndexSent: 1, status: "ACTIVE" },
    { campaignId: pathB.id, lead: byName("Devon Walsh"), lastStepIndexSent: 3, status: "COMPLETED" },
  ];

  for (const e of enrollments) {
    if (!e.lead) continue;
    await prisma.hvacCampaignLead.upsert({
      where: { campaignId_leadId: { campaignId: e.campaignId, leadId: e.lead.id } },
      update: {},
      create: {
        campaignId: e.campaignId,
        leadId: e.lead.id,
        lastStepIndexSent: e.lastStepIndexSent,
        status: e.status,
      },
    });
  }
}

async function main() {
  console.log("1/3 Seeding local dashboard account...");
  run("node", ["scripts/seed-tech.mjs"], { SEED_EMAIL: LOCAL_EMAIL, SEED_PASSWORD: LOCAL_PASSWORD });

  console.log("\n2/3 Seeding campaign templates (Paths A-D)...");
  run("node", ["scripts/seed-campaigns.mjs"]);

  console.log("\n3/3 Seeding sample leads, activity, chat transcripts, and campaign enrollments...");
  const leads = await seedLeads();
  await seedChatTranscript(leads.find((l) => l.name === "Alicia Chen"));
  await seedChatTranscript(leads.find((l) => l.name === "Priya Nair"));
  await seedCampaignEnrollments(leads);

  console.log(`
✅ Local dev environment seeded.

   Dashboard login:
     Email:    ${LOCAL_EMAIL}
     Password: ${LOCAL_PASSWORD}

   ${SAMPLE_LEADS.length} sample leads across every pipeline stage, 4 campaign
   templates (Paths A-D), 4 campaign enrollments, and 2 sample chat
   transcripts were created. Re-running this script is safe — everything is
   upserted.
`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
