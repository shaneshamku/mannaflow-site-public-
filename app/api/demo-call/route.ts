import { NextResponse } from "next/server";

/* Mints a short-lived Retell web-call session for the "Talk to Maddie" site
 * demo. Only ever returns an access_token to the client — the Retell API key
 * never leaves the server. Agent is a dedicated demo build (see
 * voice-agent/README.md): same prompt/branding as the live phone line, real
 * Cal.com booking, but transfer_call removed so public traffic can't dial
 * the real on-call number. */

const RETELL_API_URL = "https://api.retellai.com/v2/create-web-call";

export async function POST() {
  const apiKey = process.env.RETELL_API_KEY;
  const agentId = process.env.RETELL_DEMO_AGENT_ID;

  if (!apiKey || !agentId) {
    console.error("RETELL_API_KEY or RETELL_DEMO_AGENT_ID is not configured");
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const res = await fetch(RETELL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agent_id: agentId }),
    });

    if (!res.ok) {
      console.error("Retell create-web-call failed:", res.status, await res.text());
      return NextResponse.json({ error: "Could not start call" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ accessToken: data.access_token });
  } catch (err) {
    console.error("Demo call error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
