import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function sendEscalationAlert(
  leadPhone: string,
  leadName: string | null,
  transcript: { role: string; content: string }[]
) {
  const transcriptText = transcript
    .map((m) => `${m.role === "USER" ? "Customer" : "Bot"}: ${m.content}`)
    .join("\n");

  await getResend().emails.send({
    from: "MannaFlow HVAC <noreply@mannaflow.ca>",
    to: process.env.TECH_EMAIL!,
    subject: `Action Required: HVAC Lead Escalation — ${leadName ?? leadPhone}`,
    text: `A customer has requested immediate attention.\n\nCustomer: ${leadName ?? "Unknown"}\nPhone: ${leadPhone}\n\n--- Conversation Transcript ---\n${transcriptText}`,
  });
}
