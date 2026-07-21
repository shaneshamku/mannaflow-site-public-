import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CampaignStep, isValidTimezone, parseStepsInput, stepsToIntervals } from "@/lib/campaigns";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.hvacCampaign.findUnique({
    where: { id },
    include: {
      leads: {
        orderBy: { assignedAt: "desc" },
        include: { lead: true },
      },
    },
  });

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const steps = (campaign.steps as unknown as CampaignStep[]) ?? [];
  const intervals = stepsToIntervals(steps);
  const stepsWithIntervals = steps.map((step, i) => ({ ...step, intervalDays: intervals[i] }));

  return NextResponse.json({
    ...campaign,
    steps: stepsWithIntervals,
    leads: campaign.leads.map((l) => ({ ...l, hasOverride: l.stepOverrides != null })),
  });
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  let stepsData: CampaignStep[] | undefined;
  if (data.steps !== undefined) {
    const parsed = parseStepsInput(data.steps);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    stepsData = parsed.steps;
  }

  if (data.timezone !== undefined && !isValidTimezone(data.timezone)) {
    return NextResponse.json({ error: "timezone must be a valid IANA timezone (e.g. America/New_York)" }, { status: 400 });
  }

  const campaign = await prisma.hvacCampaign.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(stepsData !== undefined ? { steps: stepsData } : {}),
      ...(data.timezone !== undefined ? { timezone: data.timezone } : {}),
    },
  });
  return NextResponse.json(campaign);
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.hvacCampaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
