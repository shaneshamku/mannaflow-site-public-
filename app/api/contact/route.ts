import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const MAX_LENGTHS: Record<string, number> = {
  name: 100,
  email: 254,
  phone: 30,
  company: 150,
  businessType: 100,
  message: 2000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[\r\n]+/g, " ");
}

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  const name = sanitize(raw.name);
  const email = sanitize(raw.email);
  const phone = sanitize(raw.phone);
  const company = sanitize(raw.company);
  const businessType = sanitize(raw.businessType);
  const message = sanitize(raw.message);

  for (const [field, value] of Object.entries({ name, email, phone, company, businessType, message })) {
    if (value.length > MAX_LENGTHS[field]) {
      return NextResponse.json(
        { error: `${field} exceeds maximum allowed length` },
        { status: 400 }
      );
    }
  }

  if (!name || !email || !businessType) {
    return NextResponse.json(
      { error: "Name, email, and business type are required." },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "MannaFlow Website <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL ?? "mannaflow.io@gmail.com",
      subject: `Demo request: ${name} (${businessType})`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Company: ${company || "Not provided"}`,
        `Trade / Business Type: ${businessType}`,
        `Message: ${message || "None"}`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
