import { HvacLead, HvacCampaign, HvacCampaignLead } from "@prisma/client";
import { prisma } from "./prisma";
import { sendSMS } from "./twilio";
import { sendCampaignEmail } from "./gmail";

// See docs/CAMPAIGN_ENGINE.md for the full design writeup — what this does,
// why each decision was made, and known gaps/simplifications.

export type CampaignStep = {
  day: number;
  channel: string;
  intent: string;
  sampleCopy?: string;
  sendSms?: boolean;
  sendEmail?: boolean;
  smsBody?: string;
  emailSubject?: string;
  emailBody?: string;
  skipIfReplied?: boolean;
  onlyIfUrgency?: string[];
  needsManualCallback?: boolean;
};

const STOP_STAGES = ["JOB_BOOKED", "JOB_COMPLETE", "INVOICE_SENT", "PAID"];
const DEFAULT_BOOKING_LINK = "https://mannaflow-site.vercel.app/book-demo";

function resolveMergeTags(template: string, lead: HvacLead) {
  const link = process.env.BOOKING_LINK || DEFAULT_BOOKING_LINK;
  return template
    .replaceAll("{{name}}", lead.name?.trim() || "there")
    .replaceAll("{{issue}}", lead.issueDescription?.trim() || "your HVAC system")
    .replaceAll("{{link}}", link);
}

async function hasRepliedSince(leadId: string, since: Date) {
  const msg = await prisma.hvacChatMessage.findFirst({
    where: { leadId, role: "USER", timestamp: { gte: since } },
  });
  return !!msg;
}

function urgencyAllows(step: CampaignStep, lead: HvacLead) {
  if (!step.onlyIfUrgency || step.onlyIfUrgency.length === 0) return true;
  return !!lead.urgencyLevel && step.onlyIfUrgency.includes(lead.urgencyLevel);
}

export type ProcessResult = {
  assignmentId: string;
  leadId: string;
  campaignName: string;
  action: "stopped" | "sent" | "skipped" | "noop";
  stepIndex?: number;
  channels?: string[];
  reason?: string;
};

type Assignment = HvacCampaignLead & { lead: HvacLead; campaign: HvacCampaign };

export async function processCampaignAssignment(
  assignment: Assignment,
  opts: { dryRun?: boolean } = {}
): Promise<ProcessResult[]> {
  const results: ProcessResult[] = [];
  const { lead, campaign } = assignment;

  if (STOP_STAGES.includes(lead.currentStage)) {
    const reason = `Lead reached stage ${lead.currentStage}`;
    if (!opts.dryRun) {
      await prisma.hvacCampaignLead.update({
        where: { id: assignment.id },
        data: { status: "STOPPED", stoppedReason: reason },
      });
    }
    results.push({ assignmentId: assignment.id, leadId: lead.id, campaignName: campaign.name, action: "stopped", reason });
    return results;
  }

  const steps = ((campaign.steps as unknown as CampaignStep[]) ?? []).slice().sort((a, b) => a.day - b.day);
  const elapsedDays = (Date.now() - assignment.assignedAt.getTime()) / 86_400_000;

  for (let i = assignment.lastStepIndexSent + 1; i < steps.length; i++) {
    const step = steps[i];
    if (elapsedDays < step.day) break; // steps are day-ascending; nothing further is due yet

    if (step.skipIfReplied && (await hasRepliedSince(lead.id, assignment.assignedAt))) {
      results.push({ assignmentId: assignment.id, leadId: lead.id, campaignName: campaign.name, action: "skipped", stepIndex: i, reason: "lead replied since assignment" });
      if (!opts.dryRun) await prisma.hvacCampaignLead.update({ where: { id: assignment.id }, data: { lastStepIndexSent: i } });
      continue;
    }
    if (!urgencyAllows(step, lead)) {
      const reason = `urgency ${lead.urgencyLevel ?? "unset"} not in [${step.onlyIfUrgency?.join(", ")}]`;
      results.push({ assignmentId: assignment.id, leadId: lead.id, campaignName: campaign.name, action: "skipped", stepIndex: i, reason });
      if (!opts.dryRun) await prisma.hvacCampaignLead.update({ where: { id: assignment.id }, data: { lastStepIndexSent: i } });
      continue;
    }

    const channels: string[] = [];

    if (step.sendSms && step.smsBody) {
      if (!opts.dryRun) {
        const body = resolveMergeTags(step.smsBody, lead);
        await sendSMS(lead.phone, body);
        await prisma.hvacActivityLog.create({
          data: { leadId: lead.id, type: "SMS", direction: "OUTBOUND", content: `[${campaign.name}] ${body}` },
        });
      }
      channels.push("SMS");
    }

    if (step.sendEmail && step.emailBody) {
      if (lead.email) {
        if (!opts.dryRun) {
          const subject = resolveMergeTags(step.emailSubject ?? campaign.name, lead);
          const body = resolveMergeTags(step.emailBody, lead);
          await sendCampaignEmail(lead.email, subject, body);
          await prisma.hvacActivityLog.create({
            data: { leadId: lead.id, type: "EMAIL", direction: "OUTBOUND", content: `[${campaign.name}] ${subject}` },
          });
        }
        channels.push("EMAIL");
      } else if (!opts.dryRun) {
        await prisma.hvacActivityLog.create({
          data: { leadId: lead.id, type: "NOTE", content: `[${campaign.name}] Step ${i} email skipped — no email address on file` },
        });
      } else {
        channels.push("EMAIL_SKIPPED_NO_ADDRESS");
      }
    }

    if (step.needsManualCallback) {
      if (!opts.dryRun) {
        await prisma.hvacActivityLog.create({
          data: { leadId: lead.id, type: "NOTE", content: `[${campaign.name}] Step ${i} needs a human/voice callback — ${step.intent}` },
        });
        if (process.env.TECH_EMAIL) {
          await sendCampaignEmail(
            process.env.TECH_EMAIL,
            `Callback needed: ${lead.name ?? lead.phone}`,
            `${campaign.name} step ${i} calls for a human/voice callback.\n\nLead: ${lead.name ?? "Unknown"} (${lead.phone})\nIssue: ${lead.issueDescription ?? "n/a"}\n\n${step.intent}`
          );
        }
      }
      channels.push("MANUAL_CALLBACK_ALERT");
    }

    if (!opts.dryRun) {
      const isLastStep = i === steps.length - 1;
      await prisma.hvacCampaignLead.update({
        where: { id: assignment.id },
        data: { lastStepIndexSent: i, status: isLastStep ? "COMPLETED" : "ACTIVE" },
      });
    }

    results.push({ assignmentId: assignment.id, leadId: lead.id, campaignName: campaign.name, action: "sent", stepIndex: i, channels });
  }

  if (results.length === 0) {
    results.push({ assignmentId: assignment.id, leadId: lead.id, campaignName: campaign.name, action: "noop" });
  }

  return results;
}

export async function processAllActiveCampaignAssignments(opts: { dryRun?: boolean } = {}) {
  const assignments = await prisma.hvacCampaignLead.findMany({
    where: { status: "ACTIVE" },
    include: { lead: true, campaign: true },
  });

  const results: ProcessResult[] = [];
  for (const assignment of assignments) {
    try {
      results.push(...(await processCampaignAssignment(assignment, opts)));
    } catch (err) {
      console.error(`campaign processing failed for assignment ${assignment.id}:`, err);
      results.push({
        assignmentId: assignment.id,
        leadId: assignment.leadId,
        campaignName: assignment.campaign.name,
        action: "noop",
        reason: String(err),
      });
    }
  }
  return results;
}
