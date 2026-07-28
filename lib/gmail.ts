import nodemailer from "nodemailer";

// Campaign emails send from a real Gmail inbox (mannaflow.io@gmail.com) via
// SMTP + an App Password, NOT Resend — Resend can only send "From" a
// DNS-verified domain, and mannaflow.io@gmail.com is a Gmail account the
// business doesn't control at the DNS level. See docs/CAMPAIGN_ENGINE.md.
//
// Setup (one-time, done by a human in the Google Account, not by this code):
//   1. Enable 2-Step Verification on the mannaflow.io@gmail.com account.
//   2. Generate an App Password at https://myaccount.google.com/apppasswords
//   3. Set GMAIL_USER=mannaflow.io@gmail.com and GMAIL_APP_PASSWORD=<the 16-char
//      app password> in .env / Vercel env vars.

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  return transporter;
}

export async function sendCampaignEmail(to: string, subject: string, text: string) {
  const t = getTransporter();
  if (!t) {
    console.error("sendCampaignEmail skipped — GMAIL_USER/GMAIL_APP_PASSWORD not configured");
    return null;
  }

  return t.sendMail({
    from: `MannaFlow CONTRACTOR <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
  });
}
