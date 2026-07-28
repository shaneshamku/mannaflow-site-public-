import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";
import { prisma } from "@/lib/prisma";
import { anthropic, SYSTEM_PROMPT, INFO_EXTRACT_PROMPT, shouldEscalate } from "@/lib/claude";
import { sendEscalationAlert } from "@/lib/resend";
import { autoAssignPathBOnInboundReply } from "@/lib/campaigns";
import { ContractorServiceType, ContractorUrgencyLevel } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const params: Record<string, string> = {};
  body.forEach((v, k) => { params[k] = v.toString(); });

  const from = params["From"];
  const to = params["To"];
  const messageBody = params["Body"]?.trim();
  if (!from || !messageBody) return new NextResponse("", { status: 200 });

  const organization = to ? await prisma.contractorOrganization.findUnique({ where: { inboundPhone: to } }) : null;
  if (!organization?.inboundPhone) {
    console.error("twilio/sms-inbound rejected: inbound number is not assigned to an organization");
    return new NextResponse("", { status: 200 });
  }

  // Upsert lead
  let lead = await prisma.contractorLead.findUnique({ where: { organizationId_phone: { organizationId: organization.id, phone: from } } });
  if (!lead) {
    lead = await prisma.contractorLead.create({
      data: { organizationId: organization.id, phone: from, leadSource: "Inbound SMS", currentStage: "NEW_LEAD", dateEnteredStage: new Date() },
    });
  }

  // Persist inbound message
  await prisma.contractorChatMessage.create({
    data: { leadId: lead.id, organizationId: organization.id, role: "USER", content: messageBody },
  });
  await prisma.contractorActivityLog.create({
    data: { leadId: lead.id, organizationId: organization.id, type: "SMS", direction: "INBOUND", content: messageBody },
  });

  await autoAssignPathBOnInboundReply(lead.id, organization.id);

  // Hard trigger check
  if (shouldEscalate(messageBody)) {
    const escalationMsg =
      "I've flagged this as urgent. A technician will reach out to you very shortly, please call 911 if this is a safety emergency.";
    await sendSMS(from, escalationMsg, organization.inboundPhone);
    await persistAndEscalate(lead.id, organization.id, from, lead.name, escalationMsg);
    return new NextResponse("", { status: 200 });
  }

  // Build conversation history (last 20 messages)
  const history = await prisma.contractorChatMessage.findMany({
    where: { leadId: lead.id },
    orderBy: { timestamp: "asc" },
    take: 20,
  });

  const messages = history.map((m) => ({
    role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  // Generate AI reply + extract lead info in parallel
  const conversationText = history.map((m) => `${m.role}: ${m.content}`).join("\n");
  const [aiResponse, extractedInfo] = await Promise.all([
    anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    }),
    extractLeadInfo(conversationText),
  ]);

  const rawReply = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "";
  const isEscalation = rawReply.startsWith("[ESCALATE]");
  const replyText = isEscalation ? rawReply.slice("[ESCALATE]".length).trim() : rawReply;

  await sendSMS(from, replyText, organization.inboundPhone);

  await prisma.contractorChatMessage.create({
    data: { leadId: lead.id, organizationId: organization.id, role: "ASSISTANT", content: replyText, escalated: isEscalation },
  });
  await prisma.contractorActivityLog.create({
    data: { leadId: lead.id, organizationId: organization.id, type: "SMS", direction: "OUTBOUND", content: replyText },
  });

  // Auto-update lead record with any info Claude extracted
  if (extractedInfo) {
    await updateLeadFromExtraction(lead.id, extractedInfo);
  }

  if (isEscalation) {
    await alertTech(lead.id, organization.id, from, lead.name);
  }

  return new NextResponse("", { status: 200 });
}

async function extractLeadInfo(conversationText: string) {
  try {
    const result = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [{ role: "user", content: INFO_EXTRACT_PROMPT + conversationText }],
    });
    const text = result.content[0].type === "text" ? result.content[0].text.trim() : "";
    return JSON.parse(text) as {
      name: string | null;
      email: string | null;
      address: string | null;
      issueDescription: string | null;
      serviceType: ContractorServiceType | null;
      urgencyLevel: ContractorUrgencyLevel | null;
    };
  } catch {
    return null;
  }
}

async function updateLeadFromExtraction(
  leadId: string,
  info: {
    name: string | null;
    email: string | null;
    address: string | null;
    issueDescription: string | null;
    serviceType: ContractorServiceType | null;
    urgencyLevel: ContractorUrgencyLevel | null;
  }
) {
  const current = await prisma.contractorLead.findUnique({ where: { id: leadId } });
  if (!current) return;

  const updates: Record<string, string | null> = {};
  if (!current.name && info.name) updates.name = info.name;
  if (!current.email && info.email) updates.email = info.email;
  if (!current.address && info.address) updates.address = info.address;
  if (!current.issueDescription && info.issueDescription) updates.issueDescription = info.issueDescription;
  if (!current.serviceType && info.serviceType) updates.serviceType = info.serviceType;
  if (!current.urgencyLevel && info.urgencyLevel) updates.urgencyLevel = info.urgencyLevel;

  if (Object.keys(updates).length > 0) {
    await prisma.contractorLead.update({ where: { id: leadId }, data: updates });
  }
}

async function persistAndEscalate(
  leadId: string,
  organizationId: string,
  phone: string,
  name: string | null,
  sentMsg: string
) {
  await prisma.contractorChatMessage.create({
    data: { leadId, organizationId, role: "ASSISTANT", content: sentMsg, escalated: true },
  });
  await prisma.contractorActivityLog.create({
    data: { leadId, organizationId, type: "SMS", direction: "OUTBOUND", content: sentMsg },
  });
  await alertTech(leadId, organizationId, phone, name);
}

async function alertTech(leadId: string, organizationId: string, phone: string, name: string | null) {
  const transcript = await prisma.contractorChatMessage.findMany({
    where: { leadId },
    orderBy: { timestamp: "asc" },
  });

  await prisma.contractorChatMessage.updateMany({
    where: { leadId, escalated: false },
    data: { escalated: true },
  });

  await sendEscalationAlert(phone, name, transcript);

  await prisma.contractorActivityLog.create({
    data: { leadId, organizationId, type: "NOTE", content: "Conversation escalated — tech alert sent" },
  });
}
