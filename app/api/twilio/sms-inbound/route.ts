import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";
import { prisma } from "@/lib/prisma";
import { anthropic, SYSTEM_PROMPT, INFO_EXTRACT_PROMPT, shouldEscalate } from "@/lib/claude";
import { sendEscalationAlert } from "@/lib/resend";
import { HvacServiceType, HvacUrgencyLevel } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const params: Record<string, string> = {};
  body.forEach((v, k) => { params[k] = v.toString(); });

  const from = params["From"];
  const messageBody = params["Body"]?.trim();
  if (!from || !messageBody) return new NextResponse("", { status: 200 });

  // Upsert lead
  let lead = await prisma.hvacLead.findUnique({ where: { phone: from } });
  if (!lead) {
    lead = await prisma.hvacLead.create({
      data: { phone: from, leadSource: "Inbound SMS", currentStage: "NEW_LEAD", dateEnteredStage: new Date() },
    });
  }

  // Customer replied — cancel the 24h follow-up
  await prisma.hvacFollowUpJob.deleteMany({ where: { leadId: lead.id } });

  // Persist inbound message
  await prisma.hvacChatMessage.create({
    data: { leadId: lead.id, role: "USER", content: messageBody },
  });
  await prisma.hvacActivityLog.create({
    data: { leadId: lead.id, type: "SMS", direction: "INBOUND", content: messageBody },
  });

  // Hard trigger check
  if (shouldEscalate(messageBody)) {
    const escalationMsg =
      "I've flagged this as urgent. A technician will reach out to you very shortly — please call 911 if this is a safety emergency.";
    await sendSMS(from, escalationMsg);
    await persistAndEscalate(lead.id, from, lead.name, escalationMsg);
    return new NextResponse("", { status: 200 });
  }

  // Build conversation history (last 20 messages)
  const history = await prisma.hvacChatMessage.findMany({
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

  await sendSMS(from, replyText);

  await prisma.hvacChatMessage.create({
    data: { leadId: lead.id, role: "ASSISTANT", content: replyText, escalated: isEscalation },
  });
  await prisma.hvacActivityLog.create({
    data: { leadId: lead.id, type: "SMS", direction: "OUTBOUND", content: replyText },
  });

  // Auto-update lead record with any info Claude extracted
  if (extractedInfo) {
    await updateLeadFromExtraction(lead.id, extractedInfo);
  }

  if (isEscalation) {
    await alertTech(lead.id, from, lead.name);
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
      serviceType: HvacServiceType | null;
      urgencyLevel: HvacUrgencyLevel | null;
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
    serviceType: HvacServiceType | null;
    urgencyLevel: HvacUrgencyLevel | null;
  }
) {
  const current = await prisma.hvacLead.findUnique({ where: { id: leadId } });
  if (!current) return;

  const updates: Record<string, string | null> = {};
  if (!current.name && info.name) updates.name = info.name;
  if (!current.email && info.email) updates.email = info.email;
  if (!current.address && info.address) updates.address = info.address;
  if (!current.issueDescription && info.issueDescription) updates.issueDescription = info.issueDescription;
  if (!current.serviceType && info.serviceType) updates.serviceType = info.serviceType;
  if (!current.urgencyLevel && info.urgencyLevel) updates.urgencyLevel = info.urgencyLevel;

  if (Object.keys(updates).length > 0) {
    await prisma.hvacLead.update({ where: { id: leadId }, data: updates });
  }
}

async function persistAndEscalate(
  leadId: string,
  phone: string,
  name: string | null,
  sentMsg: string
) {
  await prisma.hvacChatMessage.create({
    data: { leadId, role: "ASSISTANT", content: sentMsg, escalated: true },
  });
  await prisma.hvacActivityLog.create({
    data: { leadId, type: "SMS", direction: "OUTBOUND", content: sentMsg },
  });
  await alertTech(leadId, phone, name);
}

async function alertTech(leadId: string, phone: string, name: string | null) {
  const transcript = await prisma.hvacChatMessage.findMany({
    where: { leadId },
    orderBy: { timestamp: "asc" },
  });

  await prisma.hvacChatMessage.updateMany({
    where: { leadId, escalated: false },
    data: { escalated: true },
  });

  await sendEscalationAlert(phone, name, transcript);

  await prisma.hvacActivityLog.create({
    data: { leadId, type: "NOTE", content: "Conversation escalated — tech alert sent" },
  });
}
