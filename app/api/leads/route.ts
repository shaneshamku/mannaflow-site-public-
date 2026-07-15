import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leads = await prisma.hvacLead.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { activityLogs: true } } },
  });

  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const lead = await prisma.hvacLead.create({
    data: {
      ...data,
      serviceType: data.serviceType || null,
      urgencyLevel: data.urgencyLevel || null,
      currentStage: "NEW_LEAD",
      dateEnteredStage: new Date(),
    },
  });

  await prisma.hvacActivityLog.create({
    data: { leadId: lead.id, type: "NOTE", content: "Lead created manually" },
  });

  return NextResponse.json(lead, { status: 201 });
}
