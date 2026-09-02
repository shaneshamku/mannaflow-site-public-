import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { anthropic, buildSystemPrompt, buildInfoExtractPrompt } from "@/lib/claude";
import { guardChiropracticReply } from "@/lib/guards";
import { sendEscalationAlert } from "@/lib/resend";
import { autoAssignPathBOnInboundReply } from "@/lib/campaigns";
import type { ContractorServiceType, ContractorUrgencyLevel, Vertical } from "@/lib/types";

type AdminClient = ReturnType<typeof createAdminSupabaseClient>;

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const params: Record<string, string> = {};
  body.forEach((v, k) => { params[k] = v.toString(); });

  const from = params["From"];
  const to = params["To"];
  const messageBody = params["Body"]?.trim();
  if (!from || !messageBody) return new NextResponse("", { status: 200 });

  const admin = createAdminSupabaseClient();

  const organization = to
    ? (await admin.from("organizations").select("id, name, inbound_phone, vertical, booking_url").eq("inbound_phone", to).maybeSingle()).data
    : null;
  if (!organization?.inbound_phone) {
    console.error("twilio/sms-inbound rejected: inbound number is not assigned to an organization");
    return new NextResponse("", { status: 200 });
  }

  // Upsert lead
  let { data: lead } = await admin.from("leads").select("*").eq("organization_id", organization.id).eq("phone", from).maybeSingle();
  if (!lead) {
    const { data: created, error } = await admin
      .from("leads")
      .insert({ organization_id: organization.id, phone: from, lead_source: "Inbound SMS", current_stage: "NEW_LEAD" })
      .select()
      .single();
    if (error || !created) {
      console.error("twilio/sms-inbound: failed to create lead", error);
      return new NextResponse("", { status: 200 });
    }
    lead = created;
  }

  // Persist inbound message
  await admin.from("messages").insert({ lead_id: lead.id, organization_id: organization.id, role: "USER", content: messageBody });
  await admin.from("activities").insert({ lead_id: lead.id, organization_id: organization.id, type: "SMS", direction: "INBOUND", content: messageBody });

  await autoAssignPathBOnInboundReply(lead.id, organization.id);

  // Build conversation history (last 20 messages)
  const { data: historyRows } = await admin
    .from("messages")
    .select("*")
    .eq("lead_id", lead.id)
    .order("occurred_at", { ascending: true })
    .limit(20);
  const history = historyRows ?? [];

  const messages = history.map((m) => ({
    role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
    content: m.content as string,
  }));

  // Generate AI reply + extract lead info in parallel
  const conversationText = history.map((m) => `${m.role}: ${m.content}`).join("\n");
  const [aiResponse, extractedInfo] = await Promise.all([
    anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      system: buildSystemPrompt(organization.vertical, organization.name, organization.booking_url),
      messages,
    }),
    extractLeadInfo(organization.vertical, conversationText),
  ]);

  const rawReply = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "";
  const isEscalation = rawReply.startsWith("[ESCALATE]");
  let replyText = isEscalation ? rawReply.slice("[ESCALATE]".length).trim() : rawReply;

  if (organization.vertical === "chiropractic") {
    replyText = guardChiropracticReply(
      replyText,
      "That's best discussed with the doctor directly. What's your name so we can get you booked in?"
    );
  }

  await sendSMS(from, replyText, organization.inbound_phone);

  await admin.from("messages").insert({ lead_id: lead.id, organization_id: organization.id, role: "ASSISTANT", content: replyText, escalated: isEscalation });
  await admin.from("activities").insert({ lead_id: lead.id, organization_id: organization.id, type: "SMS", direction: "OUTBOUND", content: replyText });

  // Auto-update lead record with any info Claude extracted
  if (extractedInfo) {
    await updateLeadFromExtraction(admin, lead.id, extractedInfo);
  }

  // Notify a technician once per lead — not on every escalated turn, so an
  // ongoing emergency conversation doesn't spam repeat alerts while the AI
  // keeps [ESCALATE]-tagging follow-up replies.
  if (isEscalation && !(await alreadyAlerted(admin, lead.id))) {
    await alertTech(admin, lead.id, organization.id, from, lead.name);
  }

  return new NextResponse("", { status: 200 });
}

async function extractLeadInfo(vertical: Vertical, conversationText: string) {
  try {
    const result = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [{ role: "user", content: buildInfoExtractPrompt(vertical, conversationText) }],
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
  admin: AdminClient,
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
  const { data: current } = await admin.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (!current) return;

  const updates: Record<string, string | null> = {};
  if (!current.name && info.name) updates.name = info.name;
  if (!current.email && info.email) updates.email = info.email;
  if (!current.address && info.address) updates.address = info.address;
  if (!current.issue_description && info.issueDescription) updates.issue_description = info.issueDescription;
  if (!current.service_type && info.serviceType) updates.service_type = info.serviceType;
  if (!current.urgency_level && info.urgencyLevel) updates.urgency_level = info.urgencyLevel;

  if (Object.keys(updates).length > 0) {
    await admin.from("leads").update(updates).eq("id", leadId);
  }
}

async function alreadyAlerted(admin: AdminClient, leadId: string): Promise<boolean> {
  const { data } = await admin.from("messages").select("id").eq("lead_id", leadId).eq("escalated", true).limit(1);
  return Boolean(data?.length);
}

async function alertTech(admin: AdminClient, leadId: string, organizationId: string, phone: string, name: string | null) {
  const { data: transcript } = await admin.from("messages").select("role, content").eq("lead_id", leadId).order("occurred_at", { ascending: true });

  await admin.from("messages").update({ escalated: true }).eq("lead_id", leadId).eq("escalated", false);

  await sendEscalationAlert(phone, name, transcript ?? []);

  await admin.from("activities").insert({ lead_id: leadId, organization_id: organizationId, type: "NOTE", content: "Conversation escalated — tech alert sent" });
}
