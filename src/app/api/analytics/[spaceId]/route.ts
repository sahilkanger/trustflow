import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ spaceId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const { spaceId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const space = await prisma.space.findUnique({
    where: { id: spaceId, userId: session.user.id },
    include: {
      _count: {
        select: { testimonials: true },
      },
      testimonials: {
        select: {
          status: true,
          rating: true,
        },
      },
    },
  });

  if (!space) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const total = space.testimonials.length;
  const approved = space.testimonials.filter((t) => t.status === "APPROVED").length;
  const pending = space.testimonials.filter((t) => t.status === "PENDING").length;

  const withRating = space.testimonials.filter((t) => t.rating !== null);
  const avgRating =
    withRating.length > 0
      ? withRating.reduce((s, t) => s + (t.rating || 0), 0) / withRating.length
      : null;

  return NextResponse.json({
    total,
    approved,
    pending,
    avgRating,
    pageViews: space.pageViews,
    submissions: space.submissions,
  });
}
