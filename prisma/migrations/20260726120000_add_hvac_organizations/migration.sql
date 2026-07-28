-- Multi-tenant dashboard security boundary. Existing local data is assigned to
-- the internal organization before organization ownership becomes required.
CREATE TYPE "hvac"."HvacUserRole" AS ENUM ('INTERNAL_ADMIN', 'CLIENT_ADMIN', 'CLIENT_MEMBER');

CREATE TABLE "hvac"."HvacOrganization" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "inboundPhone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HvacOrganization_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "HvacOrganization_name_key" ON "hvac"."HvacOrganization"("name");
CREATE UNIQUE INDEX "HvacOrganization_inboundPhone_key" ON "hvac"."HvacOrganization"("inboundPhone");

INSERT INTO "hvac"."HvacOrganization" ("id", "name", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'MannaFlow Internal', CURRENT_TIMESTAMP);

ALTER TABLE "hvac"."HvacTechUser" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "hvac"."HvacTechUser" ADD COLUMN "role" "hvac"."HvacUserRole" NOT NULL DEFAULT 'CLIENT_MEMBER';
ALTER TABLE "hvac"."HvacLead" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "hvac"."HvacCampaign" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "hvac"."HvacActivityLog" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "hvac"."HvacChatMessage" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "hvac"."HvacFollowUpJob" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "hvac"."HvacCampaignLead" ADD COLUMN "organizationId" TEXT;

UPDATE "hvac"."HvacTechUser" SET "organizationId" = '00000000-0000-0000-0000-000000000001', "role" = 'INTERNAL_ADMIN' WHERE "organizationId" IS NULL;
UPDATE "hvac"."HvacLead" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "hvac"."HvacCampaign" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "hvac"."HvacActivityLog" a SET "organizationId" = l."organizationId" FROM "hvac"."HvacLead" l WHERE a."leadId" = l."id";
UPDATE "hvac"."HvacChatMessage" m SET "organizationId" = l."organizationId" FROM "hvac"."HvacLead" l WHERE m."leadId" = l."id";
UPDATE "hvac"."HvacFollowUpJob" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "hvac"."HvacCampaignLead" cl SET "organizationId" = l."organizationId" FROM "hvac"."HvacLead" l WHERE cl."leadId" = l."id";

ALTER TABLE "hvac"."HvacTechUser" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "hvac"."HvacLead" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "hvac"."HvacCampaign" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "hvac"."HvacActivityLog" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "hvac"."HvacChatMessage" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "hvac"."HvacFollowUpJob" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "hvac"."HvacCampaignLead" ALTER COLUMN "organizationId" SET NOT NULL;

DROP INDEX "hvac"."HvacLead_phone_key";
CREATE UNIQUE INDEX "HvacLead_organizationId_phone_key" ON "hvac"."HvacLead"("organizationId", "phone");
CREATE UNIQUE INDEX "HvacCampaign_organizationId_path_key" ON "hvac"."HvacCampaign"("organizationId", "path");

CREATE INDEX "HvacTechUser_organizationId_idx" ON "hvac"."HvacTechUser"("organizationId");
CREATE INDEX "HvacLead_organizationId_idx" ON "hvac"."HvacLead"("organizationId");
CREATE INDEX "HvacCampaign_organizationId_idx" ON "hvac"."HvacCampaign"("organizationId");
CREATE INDEX "HvacActivityLog_organizationId_idx" ON "hvac"."HvacActivityLog"("organizationId");
CREATE INDEX "HvacChatMessage_organizationId_idx" ON "hvac"."HvacChatMessage"("organizationId");
CREATE INDEX "HvacFollowUpJob_organizationId_idx" ON "hvac"."HvacFollowUpJob"("organizationId");
CREATE INDEX "HvacCampaignLead_organizationId_idx" ON "hvac"."HvacCampaignLead"("organizationId");

ALTER TABLE "hvac"."HvacTechUser" ADD CONSTRAINT "HvacTechUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "hvac"."HvacOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "hvac"."HvacLead" ADD CONSTRAINT "HvacLead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "hvac"."HvacOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "hvac"."HvacCampaign" ADD CONSTRAINT "HvacCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "hvac"."HvacOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "hvac"."HvacActivityLog" ADD CONSTRAINT "HvacActivityLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "hvac"."HvacOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "hvac"."HvacChatMessage" ADD CONSTRAINT "HvacChatMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "hvac"."HvacOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "hvac"."HvacFollowUpJob" ADD CONSTRAINT "HvacFollowUpJob_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "hvac"."HvacOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "hvac"."HvacCampaignLead" ADD CONSTRAINT "HvacCampaignLead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "hvac"."HvacOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
