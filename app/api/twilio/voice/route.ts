import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";
import { prisma } from "@/lib/prisma";
import { autoAssignPathAOnMissedCall } from "@/lib/campaigns";

const INITIAL_SMS =
  "Hi, thanks for calling MannaFlow HVAC! We missed your call — let us know what's going on with your HVAC system and we'll get back to you fast.";

const TWIML = `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const from = body.get("From") as string;

    if (from) {
      let lead = await prisma.hvacLead.findUnique({ where: { phone: from } });
      if (!lead) {
        lead = await prisma.hvacLead.create({
          data: {
            phone: from,
            leadSource: "Missed Call",
            currentStage: "NEW_LEAD",
            dateEnteredStage: new Date(),
          },
        });
      }

      await sendSMS(from, INITIAL_SMS);

      await prisma.hvacActivityLog.createMany({
        data: [
          { leadId: lead.id, type: "CALL", direction: "INBOUND", content: "Missed call — auto-SMS sent" },
          { leadId: lead.id, type: "SMS", direction: "OUTBOUND", content: INITIAL_SMS },
        ],
      });

      await autoAssignPathAOnMissedCall(lead.id);
    }
  } catch (err) {
    console.error("twilio/voice error:", err);
  }

  return new NextResponse(TWIML, { headers: { "Content-Type": "text/xml" } });
}
