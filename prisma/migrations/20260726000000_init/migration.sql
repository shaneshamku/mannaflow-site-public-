-- Baseline for the pre-existing HVAC dashboard schema. Existing databases
-- created with `prisma db push` must mark this migration applied before they
-- deploy subsequent migrations.
CREATE SCHEMA IF NOT EXISTS "hvac";
CREATE TYPE "hvac"."HvacPipelineStage" AS ENUM ('NEW_LEAD', 'CONTACTED', 'QUOTE_SENT', 'JOB_BOOKED', 'JOB_COMPLETE', 'INVOICE_SENT', 'PAID');
CREATE TYPE "hvac"."HvacServiceType" AS ENUM ('REPAIR', 'INSTALLATION', 'MAINTENANCE', 'EMERGENCY');
CREATE TYPE "hvac"."HvacUrgencyLevel" AS ENUM ('ROUTINE', 'URGENT', 'EMERGENCY');
CREATE TYPE "hvac"."HvacActivityType" AS ENUM ('CALL', 'SMS', 'EMAIL', 'NOTE', 'STAGE_CHANGE');
CREATE TYPE "hvac"."HvacDirection" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "hvac"."HvacMessageRole" AS ENUM ('USER', 'ASSISTANT');
CREATE TYPE "hvac"."HvacCampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');
CREATE TYPE "hvac"."HvacCampaignLeadStatus" AS ENUM ('ACTIVE', 'STOPPED', 'COMPLETED');

CREATE TABLE "hvac"."HvacLead" (
  "id" TEXT NOT NULL, "name" TEXT, "phone" TEXT NOT NULL, "email" TEXT, "address" TEXT,
  "issueDescription" TEXT, "serviceType" "hvac"."HvacServiceType", "urgencyLevel" "hvac"."HvacUrgencyLevel",
  "leadSource" TEXT NOT NULL DEFAULT 'Unknown', "notes" TEXT,
  "currentStage" "hvac"."HvacPipelineStage" NOT NULL DEFAULT 'NEW_LEAD',
  "dateEnteredStage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HvacLead_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "hvac"."HvacActivityLog" (
  "id" TEXT NOT NULL, "leadId" TEXT NOT NULL, "type" "hvac"."HvacActivityType" NOT NULL,
  "direction" "hvac"."HvacDirection", "content" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HvacActivityLog_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "hvac"."HvacChatMessage" (
  "id" TEXT NOT NULL, "leadId" TEXT NOT NULL, "role" "hvac"."HvacMessageRole" NOT NULL,
  "content" TEXT NOT NULL, "escalated" BOOLEAN NOT NULL DEFAULT false,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HvacChatMessage_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "hvac"."HvacFollowUpJob" (
  "id" TEXT NOT NULL, "leadId" TEXT NOT NULL, "phone" TEXT NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL, "sent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HvacFollowUpJob_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "hvac"."HvacTechUser" (
  "id" TEXT NOT NULL, "email" TEXT NOT NULL, "password" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HvacTechUser_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "hvac"."HvacCampaign" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "path" TEXT, "description" TEXT,
  "status" "hvac"."HvacCampaignStatus" NOT NULL DEFAULT 'ACTIVE', "steps" JSONB NOT NULL DEFAULT '[]',
  "timezone" TEXT NOT NULL DEFAULT 'UTC', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "HvacCampaign_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "hvac"."HvacCampaignLead" (
  "id" TEXT NOT NULL, "campaignId" TEXT NOT NULL, "leadId" TEXT NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "hvac"."HvacCampaignLeadStatus" NOT NULL DEFAULT 'ACTIVE',
  "lastStepIndexSent" INTEGER NOT NULL DEFAULT -1, "stoppedReason" TEXT, "stepOverrides" JSONB,
  CONSTRAINT "HvacCampaignLead_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HvacLead_phone_key" ON "hvac"."HvacLead"("phone");
CREATE UNIQUE INDEX "HvacFollowUpJob_leadId_key" ON "hvac"."HvacFollowUpJob"("leadId");
CREATE UNIQUE INDEX "HvacTechUser_email_key" ON "hvac"."HvacTechUser"("email");
CREATE UNIQUE INDEX "HvacCampaignLead_campaignId_leadId_key" ON "hvac"."HvacCampaignLead"("campaignId", "leadId");
ALTER TABLE "hvac"."HvacActivityLog" ADD CONSTRAINT "HvacActivityLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "hvac"."HvacLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hvac"."HvacChatMessage" ADD CONSTRAINT "HvacChatMessage_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "hvac"."HvacLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hvac"."HvacCampaignLead" ADD CONSTRAINT "HvacCampaignLead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "hvac"."HvacCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hvac"."HvacCampaignLead" ADD CONSTRAINT "HvacCampaignLead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "hvac"."HvacLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
