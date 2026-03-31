import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/utils";
import { z } from "zod";
import type { Plan } from "@prisma/client";

const createCampaignSchema = z.object({
  spaceId: z.string(),
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  recipients: z.array(
    z.object({
      email: z.string().email(),
      name: z.string().max(100).optional(),
    })
  ).min(1).max(500),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get("spaceId");

  if (!spaceId) {
    return NextResponse.json({ error: "spaceId required" }, { status: 400 });
  }

  // Verify ownership
  const space = await prisma.space.findUnique({
    where: { id: spaceId, userId: session.user.id },
  });
  if (!space) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const campaigns = await prisma.emailCampaign.findMany({
    where: { spaceId },
    include: { _count: { select: { recipients: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check plan
  const plan = PLANS[session.user.plan as Plan];
  if (!plan.emailCampaigns) {
    return NextResponse.json(
      { error: "Upgrade to Pro to use email campaigns" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = createCampaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  // Verify ownership
  const space = await prisma.space.findUnique({
    where: { id: parsed.data.spaceId, userId: session.user.id },
  });
  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  const campaign = await prisma.emailCampaign.create({
    data: {
      spaceId: parsed.data.spaceId,
      name: parsed.data.name,
      subject: parsed.data.subject,
      body: parsed.data.body,
      recipients: {
        create: parsed.data.recipients.map((r) => ({
          email: r.email,
          name: r.name || null,
        })),
      },
    },
    include: { _count: { select: { recipients: true } } },
  });

  return NextResponse.json(campaign, { status: 201 });
}
