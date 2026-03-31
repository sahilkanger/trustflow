import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSpaceSchema } from "@/lib/validations";
import { generateSlug, PLANS } from "@/lib/utils";
import { nanoid } from "nanoid";
import type { Plan } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const spaces = await prisma.space.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { testimonials: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(spaces);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSpaceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  // Check plan limits
  const plan = PLANS[session.user.plan as Plan];
  const spaceCount = await prisma.space.count({
    where: { userId: session.user.id },
  });

  if (spaceCount >= plan.maxSpaces) {
    return NextResponse.json(
      { error: "You've reached your space limit. Upgrade to create more." },
      { status: 403 }
    );
  }

  // Generate unique slug
  let slug = generateSlug(parsed.data.name);
  const existing = await prisma.space.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${nanoid(6)}`;
  }

  const space = await prisma.space.create({
    data: {
      name: parsed.data.name,
      slug,
      website: parsed.data.website || null,
      description: parsed.data.description || null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(space, { status: 201 });
}
