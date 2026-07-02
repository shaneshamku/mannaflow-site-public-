import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_BUSINESS_TYPES = new Set(["hvac", "residential", "commercial"]);

const MAX_LENGTHS: Record<string, number> = {
  name: 100,
  email: 254,
  phone: 30,
  businessType: 20,
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
  const businessType = sanitize(raw.businessType);
  const message = sanitize(raw.message);

  for (const [field, value] of Object.entries({ name, email, phone, businessType, message })) {
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

  if (!ALLOWED_BUSINESS_TYPES.has(businessType)) {
    return NextResponse.json({ error: "Invalid business type." }, { status: 400 });
  }

  const industryLabel =
    businessType === "hvac"
      ? "HVAC / Home Services"
      : businessType === "residential"
      ? "Residential HVAC"
      : "Commercial HVAC";

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "mannaflow Website <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL ?? "mannaflow.io@gmail.com",
      subject: `Demo request — ${name} (${industryLabel})`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Industry: ${industryLabel}`,
        `Message: ${message || "None"}`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
