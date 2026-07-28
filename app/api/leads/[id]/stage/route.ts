import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HvacPipelineStage } from "@prisma/client";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const { stage } = (await req.json()) as { stage: HvacPipelineStage };

  const lead = await prisma.hvacLead.findFirst({ where: { id, ...organizationScope(access) } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.hvacLead.update({
    where: { id },
    data: { currentStage: stage, dateEnteredStage: new Date() },
  });

  await prisma.hvacActivityLog.create({
    data: {
      leadId: id,
      organizationId: lead.organizationId,
      type: "STAGE_CHANGE",
      content: `Stage changed from ${lead.currentStage} to ${stage}`,
    },
  });

  return NextResponse.json(updated);
}
