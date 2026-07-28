import { ContractorLead, ContractorCampaign, ContractorCampaignLead } from "@prisma/client";
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
  // "HH:MM", 24-hour, local to the owning campaign's `timezone`. If set, this
  // step won't send until the current hour (in that timezone) reaches this
  // hour on/after the day it becomes due — checked by the hourly cron. If
  // unset, the step sends as soon as it's due, any hour.
  sendTime?: string;
};

const SEND_TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const DEFAULT_CAMPAIGN_TIMEZONE = "UTC";

// Validates an IANA timezone string (e.g. "America/New_York"). Used by the
// campaign PATCH route before persisting; the engine trusts stored values.
export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function currentHourInTimezone(now: Date, timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hourCycle: "h23" });
    return Number(formatter.format(now));
  } catch {
    return now.getUTCHours(); // invalid/unknown timezone — fall back to UTC rather than blocking sends
  }
}

function sendTimeReached(sendTime: string | undefined, now: Date, timezone: string): boolean {
  if (!sendTime) return true;
  const match = SEND_TIME_RE.exec(sendTime);
  if (!match) return true; // malformed value shouldn't block sending forever
  const targetHour = Number(match[1]);
  return currentHourInTimezone(now, timezone) >= targetHour;
}

export const STOP_STAGES = ["JOB_BOOKED", "JOB_COMPLETE", "INVOICE_SENT", "PAID"];
const DEFAULT_BOOKING_LINK = "https://mannaflow-site.vercel.app/book-demo";
const VALID_URGENCY_LEVELS = ["ROUTINE", "URGENT", "EMERGENCY"];

// Steps are stored/engine-facing as absolute `day` offsets since assignedAt.
// The dashboard UI edits "days after the previous step" instead, since that's
// the natural way a contractor thinks about spacing out messages. These two
// helpers are the only place that conversion happens — the engine never sees
// intervals, and the UI never computes cumulative days itself.
export function stepsToIntervals(steps: CampaignStep[]): number[] {
  return steps.map((step, i) => (i === 0 ? step.day : step.day - steps[i - 1].day));
}

export function intervalsToSteps(
  stepsWithoutDay: Omit<CampaignStep, "day">[],
  intervals: number[]
): CampaignStep[] {
  let cumulative = 0;
  return stepsWithoutDay.map((step, i) => {
    const interval = Math.max(0, Number.isFinite(intervals[i]) ? intervals[i] : 0);
    cumulative = i === 0 ? interval : cumulative + interval;
    return { ...step, day: cumulative };
  });
}

export type ParseStepsResult = { ok: true; steps: CampaignStep[] } | { ok: false; error: string };

// Validates+converts the interval-shaped step array the dashboard sends on
// campaign/lead-override PATCH requests into persisted, `day`-bearing steps.
export function parseStepsInput(input: unknown): ParseStepsResult {
  if (!Array.isArray(input)) return { ok: false, error: "steps must be an array" };

  const stepsWithoutDay: Omit<CampaignStep, "day">[] = [];
  const intervals: number[] = [];

  for (let i = 0; i < input.length; i++) {
    const raw = input[i];
    if (!raw || typeof raw !== "object") return { ok: false, error: `step ${i} must be an object` };
    const s = raw as Record<string, unknown>;

    const intervalDays = s.intervalDays;
    if (typeof intervalDays !== "number" || !Number.isFinite(intervalDays) || intervalDays < 0) {
      return { ok: false, error: `step ${i}: intervalDays must be a non-negative number` };
    }
    if (typeof s.channel !== "string" || !s.channel.trim()) {
      return { ok: false, error: `step ${i}: channel is required` };
    }
    if (typeof s.intent !== "string" || !s.intent.trim()) {
      return { ok: false, error: `step ${i}: intent is required` };
    }
    if (s.onlyIfUrgency !== undefined) {
      if (!Array.isArray(s.onlyIfUrgency) || s.onlyIfUrgency.some((u) => typeof u !== "string" || !VALID_URGENCY_LEVELS.includes(u))) {
        return { ok: false, error: `step ${i}: onlyIfUrgency must be an array of ROUTINE/URGENT/EMERGENCY` };
      }
    }
    if (s.sendTime !== undefined && s.sendTime !== null && s.sendTime !== "") {
      if (typeof s.sendTime !== "string" || !SEND_TIME_RE.test(s.sendTime)) {
        return { ok: false, error: `step ${i}: sendTime must be HH:MM (24-hour, UTC)` };
      }
    }

    const sendSms = !!s.sendSms;
    const sendEmail = !!s.sendEmail;

    intervals.push(intervalDays);
    stepsWithoutDay.push({
      channel: s.channel,
      intent: s.intent,
      sampleCopy: typeof s.sampleCopy === "string" ? s.sampleCopy : undefined,
      sendTime: typeof s.sendTime === "string" && s.sendTime !== "" ? s.sendTime : undefined,
      sendSms,
      sendEmail,
      smsBody: sendSms ? (typeof s.smsBody === "string" ? s.smsBody : "") : undefined,
      emailSubject: sendEmail ? (typeof s.emailSubject === "string" ? s.emailSubject : "") : undefined,
      emailBody: sendEmail ? (typeof s.emailBody === "string" ? s.emailBody : "") : undefined,
      skipIfReplied: !!s.skipIfReplied,
      onlyIfUrgency: s.onlyIfUrgency as string[] | undefined,
      needsManualCallback: !!s.needsManualCallback,
    });
  }

  return { ok: true, steps: intervalsToSteps(stepsWithoutDay, intervals) };
}

function resolveMergeTags(template: string, lead: ContractorLead) {
  const link = process.env.BOOKING_LINK || DEFAULT_BOOKING_LINK;
  return template
    .replaceAll("{{name}}", lead.name?.trim() || "there")
    .replaceAll("{{issue}}", lead.issueDescription?.trim() || "your CONTRACTOR system")
    .replaceAll("{{link}}", link);
}

async function hasRepliedSince(leadId: string, since: Date) {
  const msg = await prisma.contractorChatMessage.findFirst({
    where: { leadId, role: "USER", timestamp: { gte: since } },
  });
  return !!msg;
}

function urgencyAllows(step: CampaignStep, lead: ContractorLead) {
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

type Assignment = ContractorCampaignLead & {
  lead: ContractorLead;
  campaign: ContractorCampaign & { organization: { inboundPhone: string | null } };
};

export async function processCampaignAssignment(
  assignment: Assignment,
  opts: { dryRun?: boolean } = {}
): Promise<ProcessResult[]> {
  const results: ProcessResult[] = [];
  const { lead, campaign } = assignment;

  if (STOP_STAGES.includes(lead.currentStage)) {
    const reason = `Lead reached stage ${lead.currentStage}`;
    if (!opts.dryRun) {
      await prisma.contractorCampaignLead.update({
        where: { id: assignment.id },
        data: { status: "STOPPED", stoppedReason: reason },
      });
    }
    results.push({ assignmentId: assignment.id, leadId: lead.id, campaignName: campaign.name, action: "stopped", reason });
    return results;
  }

  const rawSteps =
    (assignment.stepOverrides as unknown as CampaignStep[] | null) ??
    (campaign.steps as unknown as CampaignStep[]) ??
    [];
  const steps = rawSteps.slice().sort((a, b) => a.day - b.day);
  const now = new Date();
  const elapsedDays = (now.getTime() - assignment.assignedAt.getTime()) / 86_400_000;

  for (let i = assignment.lastStepIndexSent + 1; i < steps.length; i++) {
    const step = steps[i];
    if (elapsedDays < step.day) break; // steps are day-ascending; nothing further is due yet
    // A step with sendTime set waits for that UTC hour on its due day — order
    // is sequential, so if this step isn't time-ready yet, nothing after it
    // can send this run either.
    if (!sendTimeReached(step.sendTime, now, campaign.timezone || DEFAULT_CAMPAIGN_TIMEZONE)) break;

    if (step.skipIfReplied && (await hasRepliedSince(lead.id, assignment.assignedAt))) {
      results.push({ assignmentId: assignment.id, leadId: lead.id, campaignName: campaign.name, action: "skipped", stepIndex: i, reason: "lead replied since assignment" });
      if (!opts.dryRun) await prisma.contractorCampaignLead.update({ where: { id: assignment.id }, data: { lastStepIndexSent: i } });
      continue;
    }
    if (!urgencyAllows(step, lead)) {
      const reason = `urgency ${lead.urgencyLevel ?? "unset"} not in [${step.onlyIfUrgency?.join(", ")}]`;
      results.push({ assignmentId: assignment.id, leadId: lead.id, campaignName: campaign.name, action: "skipped", stepIndex: i, reason });
      if (!opts.dryRun) await prisma.contractorCampaignLead.update({ where: { id: assignment.id }, data: { lastStepIndexSent: i } });
      continue;
    }

    const channels: string[] = [];

    if (step.sendSms && step.smsBody) {
      if (!opts.dryRun) {
        const body = resolveMergeTags(step.smsBody, lead);
        await sendSMS(lead.phone, body, campaign.organization.inboundPhone ?? undefined);
        await prisma.contractorActivityLog.create({
          data: { leadId: lead.id, organizationId: lead.organizationId, type: "SMS", direction: "OUTBOUND", content: `[${campaign.name}] ${body}` },
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
          await prisma.contractorActivityLog.create({
            data: { leadId: lead.id, organizationId: lead.organizationId, type: "EMAIL", direction: "OUTBOUND", content: `[${campaign.name}] ${subject}` },
          });
        }
        channels.push("EMAIL");
      } else if (!opts.dryRun) {
        await prisma.contractorActivityLog.create({
          data: { leadId: lead.id, organizationId: lead.organizationId, type: "NOTE", content: `[${campaign.name}] Step ${i} email skipped — no email address on file` },
        });
      } else {
        channels.push("EMAIL_SKIPPED_NO_ADDRESS");
      }
    }

    if (step.needsManualCallback) {
      if (!opts.dryRun) {
        await prisma.contractorActivityLog.create({
          data: { leadId: lead.id, organizationId: lead.organizationId, type: "NOTE", content: `[${campaign.name}] Step ${i} needs a human/voice callback — ${step.intent}` },
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
      await prisma.contractorCampaignLead.update({
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

// Called from the Twilio voice webhook right after a missed call. The day-0
// step is already covered by the synchronous "missed your call" SMS sent from
// that webhook, so the cursor starts at 0 (day-0 marked as already handled).
// Skipped entirely if the lead is already booked, or already active in some
// other campaign (a repeat missed call shouldn't reset progress on Path B).
export async function autoAssignPathAOnMissedCall(leadId: string, organizationId: string) {
  const lead = await prisma.contractorLead.findFirst({ where: { id: leadId, organizationId }, select: { currentStage: true } });
  if (!lead || STOP_STAGES.includes(lead.currentStage)) return;

  const alreadyActive = await prisma.contractorCampaignLead.findFirst({ where: { leadId, organizationId, status: "ACTIVE" } });
  if (alreadyActive) return;

  const campaign = await prisma.contractorCampaign.findFirst({ where: { path: "A", organizationId } });
  if (!campaign) return;

  await prisma.contractorCampaignLead.upsert({
    where: { campaignId_leadId: { campaignId: campaign.id, leadId } },
    update: {},
    create: { campaignId: campaign.id, leadId, organizationId, lastStepIndexSent: 0 },
  });
}

// Called from the SMS-inbound webhook on every inbound message. A lead that
// replies is no longer "no contact" (Path A), so any active Path A
// assignment is stopped and the lead moves to Path B ("engaged, didn't
// book") instead. Idempotent — upsert leaves an existing Path B assignment
// untouched rather than resetting its progress on a second reply.
export async function autoAssignPathBOnInboundReply(leadId: string, organizationId: string) {
  const lead = await prisma.contractorLead.findFirst({ where: { id: leadId, organizationId }, select: { currentStage: true } });
  if (!lead || STOP_STAGES.includes(lead.currentStage)) return;

  const [pathA, pathB] = await Promise.all([
    prisma.contractorCampaign.findFirst({ where: { path: "A", organizationId } }),
    prisma.contractorCampaign.findFirst({ where: { path: "B", organizationId } }),
  ]);
  if (!pathB) return;

  if (pathA) {
    await prisma.contractorCampaignLead.updateMany({
      where: { leadId, organizationId, campaignId: pathA.id, status: "ACTIVE" },
      data: { status: "STOPPED", stoppedReason: "Lead replied, moved to Path B" },
    });
  }

  await prisma.contractorCampaignLead.upsert({
    where: { campaignId_leadId: { campaignId: pathB.id, leadId } },
    update: {},
    create: { campaignId: pathB.id, leadId, organizationId },
  });
}

export async function processAllActiveCampaignAssignments(opts: { dryRun?: boolean } = {}) {
  const assignments = await prisma.contractorCampaignLead.findMany({
    where: { status: "ACTIVE" },
    include: { lead: true, campaign: { include: { organization: { select: { inboundPhone: true } } } } },
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
