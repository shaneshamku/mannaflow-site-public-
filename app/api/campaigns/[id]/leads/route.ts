import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { leadId } = await req.json();
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

  const assignment = await prisma.hvacCampaignLead.upsert({
    where: { campaignId_leadId: { campaignId: id, leadId } },
    update: {},
    create: { campaignId: id, leadId },
  });

  return NextResponse.json(assignment, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const leadId = req.nextUrl.searchParams.get("leadId");
  if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

  await prisma.hvacCampaignLead.deleteMany({ where: { campaignId: id, leadId } });
  return NextResponse.json({ ok: true });
}
