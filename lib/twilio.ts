import twilio from "twilio";

export const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER ?? "";

export const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export async function sendSMS(to: string, body: string, from = TWILIO_PHONE) {
  if (!twilioClient) {
    console.error("sendSMS skipped — TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN not configured");
    return null;
  }
  if (!from) throw new Error("No organization inbound phone is configured for this SMS");
  return twilioClient.messages.create({ from, to, body });
}

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
) {
  return twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    params
  );
}
