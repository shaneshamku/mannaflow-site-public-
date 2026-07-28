import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDashboardAccess, organizationScope } from "@/lib/dashboard-auth";

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const { leadId } = await req.json();
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

  const [campaign, lead] = await Promise.all([
    prisma.hvacCampaign.findFirst({ where: { id, ...organizationScope(access) }, select: { id: true } }),
    prisma.hvacLead.findFirst({ where: { id: leadId, ...organizationScope(access) }, select: { id: true } }),
  ]);
  if (!campaign || !lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const assignment = await prisma.hvacCampaignLead.upsert({
    where: { campaignId_leadId: { campaignId: id, leadId } },
    update: {},
    create: { campaignId: id, leadId, organizationId: access.organizationId },
  });

  return NextResponse.json(assignment, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const { access, response } = await requireDashboardAccess();
  if (!access) return response!;

  const { id } = await params;
  const leadId = req.nextUrl.searchParams.get("leadId");
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

  await prisma.hvacCampaignLead.deleteMany({ where: { campaignId: id, leadId, ...organizationScope(access) } });
  return NextResponse.json({ ok: true });
}
