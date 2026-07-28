import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CampaignStep, isValidTimezone, parseStepsInput, stepsToIntervals } from "@/lib/campaigns";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const campaign = await prisma.contractorCampaign.findFirst({
    where: { id, ...organizationScope(access) },
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
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

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

  const existing = await prisma.contractorCampaign.findFirst({ where: { id, ...organizationScope(access) }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const campaign = await prisma.contractorCampaign.update({
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
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const deleted = await prisma.contractorCampaign.deleteMany({ where: { id, ...organizationScope(access) } });
  if (deleted.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
