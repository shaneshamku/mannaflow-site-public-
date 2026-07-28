-- Rename the legacy HVAC database namespace and Prisma object names.
-- This is deliberately forward-only: earlier migrations remain immutable so
-- existing local databases and clean staging databases follow the same path.

ALTER SCHEMA "hvac" RENAME TO "contractor";

ALTER TYPE "contractor"."HvacPipelineStage" RENAME TO "ContractorPipelineStage";
ALTER TYPE "contractor"."HvacServiceType" RENAME TO "ContractorServiceType";
ALTER TYPE "contractor"."HvacUrgencyLevel" RENAME TO "ContractorUrgencyLevel";
ALTER TYPE "contractor"."HvacActivityType" RENAME TO "ContractorActivityType";
ALTER TYPE "contractor"."HvacDirection" RENAME TO "ContractorDirection";
ALTER TYPE "contractor"."HvacMessageRole" RENAME TO "ContractorMessageRole";
ALTER TYPE "contractor"."HvacCampaignStatus" RENAME TO "ContractorCampaignStatus";
ALTER TYPE "contractor"."HvacCampaignLeadStatus" RENAME TO "ContractorCampaignLeadStatus";
ALTER TYPE "contractor"."HvacUserRole" RENAME TO "ContractorUserRole";

ALTER TABLE "contractor"."HvacOrganization" RENAME TO "ContractorOrganization";
ALTER TABLE "contractor"."HvacLead" RENAME TO "ContractorLead";
ALTER TABLE "contractor"."HvacActivityLog" RENAME TO "ContractorActivityLog";
ALTER TABLE "contractor"."HvacChatMessage" RENAME TO "ContractorChatMessage";
ALTER TABLE "contractor"."HvacFollowUpJob" RENAME TO "ContractorFollowUpJob";
ALTER TABLE "contractor"."HvacTechUser" RENAME TO "ContractorTechUser";
ALTER TABLE "contractor"."HvacCampaign" RENAME TO "ContractorCampaign";
ALTER TABLE "contractor"."HvacCampaignLead" RENAME TO "ContractorCampaignLead";

ALTER INDEX "contractor"."HvacFollowUpJob_leadId_key" RENAME TO "ContractorFollowUpJob_leadId_key";
ALTER INDEX "contractor"."HvacTechUser_email_key" RENAME TO "ContractorTechUser_email_key";
ALTER INDEX "contractor"."HvacCampaignLead_campaignId_leadId_key" RENAME TO "ContractorCampaignLead_campaignId_leadId_key";
ALTER INDEX "contractor"."HvacOrganization_name_key" RENAME TO "ContractorOrganization_name_key";
ALTER INDEX "contractor"."HvacOrganization_inboundPhone_key" RENAME TO "ContractorOrganization_inboundPhone_key";
ALTER INDEX "contractor"."HvacLead_organizationId_phone_key" RENAME TO "ContractorLead_organizationId_phone_key";
ALTER INDEX "contractor"."HvacCampaign_organizationId_path_key" RENAME TO "ContractorCampaign_organizationId_path_key";
ALTER INDEX "contractor"."HvacTechUser_organizationId_idx" RENAME TO "ContractorTechUser_organizationId_idx";
ALTER INDEX "contractor"."HvacLead_organizationId_idx" RENAME TO "ContractorLead_organizationId_idx";
ALTER INDEX "contractor"."HvacCampaign_organizationId_idx" RENAME TO "ContractorCampaign_organizationId_idx";
ALTER INDEX "contractor"."HvacActivityLog_organizationId_idx" RENAME TO "ContractorActivityLog_organizationId_idx";
ALTER INDEX "contractor"."HvacChatMessage_organizationId_idx" RENAME TO "ContractorChatMessage_organizationId_idx";
ALTER INDEX "contractor"."HvacFollowUpJob_organizationId_idx" RENAME TO "ContractorFollowUpJob_organizationId_idx";
ALTER INDEX "contractor"."HvacCampaignLead_organizationId_idx" RENAME TO "ContractorCampaignLead_organizationId_idx";

ALTER TABLE "contractor"."ContractorOrganization" RENAME CONSTRAINT "HvacOrganization_pkey" TO "ContractorOrganization_pkey";
ALTER TABLE "contractor"."ContractorLead" RENAME CONSTRAINT "HvacLead_pkey" TO "ContractorLead_pkey";
ALTER TABLE "contractor"."ContractorActivityLog" RENAME CONSTRAINT "HvacActivityLog_pkey" TO "ContractorActivityLog_pkey";
ALTER TABLE "contractor"."ContractorChatMessage" RENAME CONSTRAINT "HvacChatMessage_pkey" TO "ContractorChatMessage_pkey";
ALTER TABLE "contractor"."ContractorFollowUpJob" RENAME CONSTRAINT "HvacFollowUpJob_pkey" TO "ContractorFollowUpJob_pkey";
ALTER TABLE "contractor"."ContractorTechUser" RENAME CONSTRAINT "HvacTechUser_pkey" TO "ContractorTechUser_pkey";
ALTER TABLE "contractor"."ContractorCampaign" RENAME CONSTRAINT "HvacCampaign_pkey" TO "ContractorCampaign_pkey";
ALTER TABLE "contractor"."ContractorCampaignLead" RENAME CONSTRAINT "HvacCampaignLead_pkey" TO "ContractorCampaignLead_pkey";
ALTER TABLE "contractor"."ContractorActivityLog" RENAME CONSTRAINT "HvacActivityLog_leadId_fkey" TO "ContractorActivityLog_leadId_fkey";
ALTER TABLE "contractor"."ContractorChatMessage" RENAME CONSTRAINT "HvacChatMessage_leadId_fkey" TO "ContractorChatMessage_leadId_fkey";
ALTER TABLE "contractor"."ContractorCampaignLead" RENAME CONSTRAINT "HvacCampaignLead_campaignId_fkey" TO "ContractorCampaignLead_campaignId_fkey";
ALTER TABLE "contractor"."ContractorCampaignLead" RENAME CONSTRAINT "HvacCampaignLead_leadId_fkey" TO "ContractorCampaignLead_leadId_fkey";
ALTER TABLE "contractor"."ContractorTechUser" RENAME CONSTRAINT "HvacTechUser_organizationId_fkey" TO "ContractorTechUser_organizationId_fkey";
ALTER TABLE "contractor"."ContractorLead" RENAME CONSTRAINT "HvacLead_organizationId_fkey" TO "ContractorLead_organizationId_fkey";
ALTER TABLE "contractor"."ContractorCampaign" RENAME CONSTRAINT "HvacCampaign_organizationId_fkey" TO "ContractorCampaign_organizationId_fkey";
ALTER TABLE "contractor"."ContractorActivityLog" RENAME CONSTRAINT "HvacActivityLog_organizationId_fkey" TO "ContractorActivityLog_organizationId_fkey";
ALTER TABLE "contractor"."ContractorChatMessage" RENAME CONSTRAINT "HvacChatMessage_organizationId_fkey" TO "ContractorChatMessage_organizationId_fkey";
ALTER TABLE "contractor"."ContractorFollowUpJob" RENAME CONSTRAINT "HvacFollowUpJob_organizationId_fkey" TO "ContractorFollowUpJob_organizationId_fkey";
ALTER TABLE "contractor"."ContractorCampaignLead" RENAME CONSTRAINT "HvacCampaignLead_organizationId_fkey" TO "ContractorCampaignLead_organizationId_fkey";
