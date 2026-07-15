import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/twilio";

const FOLLOW_UP_MSG = "hey, just checking in — did you still need help with your HVAC system?";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const jobs = await prisma.hvacFollowUpJob.findMany({
    where: { sent: false, scheduledAt: { lte: now } },
  });

  for (const job of jobs) {
    const replied = await prisma.hvacChatMessage.findFirst({
      where: { lead: { phone: job.phone }, role: "USER", timestamp: { gte: job.createdAt } },
    });

    if (!replied) {
      await sendSMS(job.phone, FOLLOW_UP_MSG);

      const lead = await prisma.hvacLead.findFirst({ where: { phone: job.phone } });
      if (lead) {
        await prisma.hvacActivityLog.create({
          data: { leadId: lead.id, type: "SMS", direction: "OUTBOUND", content: FOLLOW_UP_MSG },
        });
      }
    }

    await prisma.hvacFollowUpJob.update({ where: { id: job.id }, data: { sent: true } });
  }

  return NextResponse.json({ processed: jobs.length });
}
