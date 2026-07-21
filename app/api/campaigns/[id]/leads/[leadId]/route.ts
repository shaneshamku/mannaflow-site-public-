import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CampaignStep, parseStepsInput, stepsToIntervals } from "@/lib/campaigns";

type Context = { params: Promise<{ id: string; leadId: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, leadId } = await params;
  const assignment = await prisma.hvacCampaignLead.findUnique({
    where: { campaignId_leadId: { campaignId: id, leadId } },
    include: { campaign: true },
  });
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const hasOverride = assignment.stepOverrides != null;
  const steps = (hasOverride
    ? (assignment.stepOverrides as unknown as CampaignStep[])
    : (assignment.campaign.steps as unknown as CampaignStep[])) ?? [];
  const intervals = stepsToIntervals(steps);
  const stepsWithIntervals = steps.map((step, i) => ({ ...step, intervalDays: intervals[i] }));

  return NextResponse.json({ hasOverride, steps: stepsWithIntervals });
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, leadId } = await params;
  const data = await req.json();

  const parsed = parseStepsInput(data.steps);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const existing = await prisma.hvacCampaignLead.findUnique({
    where: { campaignId_leadId: { campaignId: id, leadId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.hvacCampaignLead.update({
    where: { campaignId_leadId: { campaignId: id, leadId } },
    data: { stepOverrides: parsed.steps },
  });

  const intervals = stepsToIntervals(parsed.steps);
  const stepsWithIntervals = parsed.steps.map((step, i) => ({ ...step, intervalDays: intervals[i] }));
  return NextResponse.json({ hasOverride: true, steps: stepsWithIntervals });
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, leadId } = await params;
  const existing = await prisma.hvacCampaignLead.findUnique({
    where: { campaignId_leadId: { campaignId: id, leadId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.hvacCampaignLead.update({
    where: { campaignId_leadId: { campaignId: id, leadId } },
    data: { stepOverrides: Prisma.DbNull },
  });

  return NextResponse.json({ ok: true });
}
