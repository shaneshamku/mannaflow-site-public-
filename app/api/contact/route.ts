import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY ?? "");
  try {
    const body = await req.json();
    const { name, email, phone, businessType, message } = body as {
      name?: string;
      email?: string;
      phone?: string;
      businessType?: string;
      message?: string;
    };

    if (!name || !email || !businessType) {
      return NextResponse.json(
        { error: "Name, email, and business type are required." },
        { status: 400 }
      );
    }

    const industryLabel =
      businessType === "hvac"
        ? "HVAC / Home Services"
        : businessType === "mortgage"
        ? "Mortgage Broker"
        : "Both";

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
