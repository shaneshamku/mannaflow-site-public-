import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.hvacCampaign.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { leads: true } } },
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const campaign = await prisma.hvacCampaign.create({
    data: {
      name: data.name,
      description: data.description || null,
      status: data.status || "ACTIVE",
      steps: data.steps ?? [],
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
