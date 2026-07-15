import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HvacPipelineStage } from "@prisma/client";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { stage } = (await req.json()) as { stage: HvacPipelineStage };

  const lead = await prisma.hvacLead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.hvacLead.update({
    where: { id },
    data: { currentStage: stage, dateEnteredStage: new Date() },
  });

  await prisma.hvacActivityLog.create({
    data: {
      leadId: id,
      type: "STAGE_CHANGE",
      content: `Stage changed from ${lead.currentStage} to ${stage}`,
    },
  });

  return NextResponse.json(updated);
}
