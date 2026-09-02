// Shared contractor-domain types. These used to come from the generated
// @prisma/client enums/models; Supabase stores the same values as plain
// `text` columns (no Postgres enum), so the union types live here instead.

export type ContractorPipelineStage =
  | "NEW_LEAD"
  | "CONTACTED"
  | "QUOTE_SENT"
  | "JOB_BOOKED"
  | "JOB_COMPLETE"
  | "INVOICE_SENT"
  | "PAID";

// "hvac" clients (contractor dispatch) vs. "chiropractic" clients (patient
// booking) — each gets its own chatbot prompt/extraction schema/campaign
// content. See lib/claude.ts for the per-vertical dispatch.
export type Vertical = "hvac" | "chiropractic";

export type ContractorServiceType =
  // HVAC
  | "REPAIR"
  | "INSTALLATION"
  | "MAINTENANCE"
  | "EMERGENCY"
  // Chiropractic
  | "BACK_PAIN"
  | "NECK_PAIN"
  | "HEADACHE"
  | "SPORTS_INJURY"
  | "AUTO_ACCIDENT"
  | "WELLNESS_ADJUSTMENT"
  | "PRENATAL"
  | "MASSAGE"
  | "OTHER";

export type ContractorUrgencyLevel = "ROUTINE" | "URGENT" | "EMERGENCY";

export type ContractorMessageRole = "USER" | "ASSISTANT";

export type ContractorActivityType = "CALL" | "SMS" | "EMAIL" | "NOTE" | "STAGE_CHANGE";

export type ContractorDirection = "INBOUND" | "OUTBOUND";

export type ContractorCampaignStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

export type ContractorCampaignLeadStatus = "ACTIVE" | "STOPPED" | "COMPLETED";

export type ContractorLead = {
  id: string;
  organizationId: string;
  name: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  issueDescription: string | null;
  serviceType: ContractorServiceType | null;
  urgencyLevel: ContractorUrgencyLevel | null;
  leadSource: string;
  notes: string | null;
  currentStage: ContractorPipelineStage;
  dateEnteredStage: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ContractorOrganization = {
  id: string;
  name: string;
  inboundPhone: string | null;
  vertical: Vertical;
  bookingUrl: string | null;
};

export type ContractorCampaign = {
  id: string;
  name: string;
  organizationId: string;
  path: string | null;
  description: string | null;
  status: ContractorCampaignStatus;
  steps: unknown;
  timezone: string;
};

export type ContractorCampaignLead = {
  id: string;
  campaignId: string;
  leadId: string;
  organizationId: string;
  assignedAt: Date;
  status: ContractorCampaignLeadStatus;
  lastStepIndexSent: number;
  stoppedReason: string | null;
  stepOverrides: unknown;
};
