import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getMissedCallSms } from "@/lib/claude";
import { autoAssignPathAOnMissedCall } from "@/lib/campaigns";

const TWIML = `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const from = body.get("From") as string;
    const to = body.get("To") as string;

    const admin = createAdminSupabaseClient();
    const organization = to
      ? (await admin.from("organizations").select("id, name, inbound_phone, vertical").eq("inbound_phone", to).maybeSingle()).data
      : null;

    if (from && organization) {
      const initialSms = getMissedCallSms(organization.vertical, organization.name);
      let { data: lead } = await admin.from("leads").select("id").eq("organization_id", organization.id).eq("phone", from).maybeSingle();
      if (!lead) {
        const { data: created, error } = await admin
          .from("leads")
          .insert({ organization_id: organization.id, phone: from, lead_source: "Missed Call", current_stage: "NEW_LEAD" })
          .select("id")
          .single();
        if (error || !created) {
          console.error("twilio/voice: failed to create lead", error);
          return new NextResponse(TWIML, { headers: { "Content-Type": "text/xml" } });
        }
        lead = created;
      }

      await sendSMS(from, initialSms, organization.inbound_phone!);

      await admin.from("activities").insert([
        { lead_id: lead.id, organization_id: organization.id, type: "CALL", direction: "INBOUND", content: "Missed call — auto-SMS sent" },
        { lead_id: lead.id, organization_id: organization.id, type: "SMS", direction: "OUTBOUND", content: initialSms },
      ]);

      await autoAssignPathAOnMissedCall(lead.id, organization.id);
    } else if (from) {
      console.error("twilio/voice rejected: inbound number is not assigned to an organization");
    }
  } catch (err) {
    console.error("twilio/voice error:", err);
  }

  return new NextResponse(TWIML, { headers: { "Content-Type": "text/xml" } });
}
