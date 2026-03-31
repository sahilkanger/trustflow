import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ spaceId: string }>;
}

// Public endpoint — serves testimonial data for embedded widgets
export async function GET(req: Request, { params }: RouteParams) {
  const { spaceId } = await params;

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    select: {
      id: true,
      name: true,
      primaryColor: true,
      user: { select: { plan: true } },
      testimonials: {
        where: { status: "APPROVED" },
        orderBy: [
          { highlighted: "desc" },
          { createdAt: "desc" },
        ],
        select: {
          id: true,
          text: true,
          rating: true,
          authorName: true,
          authorTitle: true,
          authorCompany: true,
          authorAvatar: true,
          highlighted: true,
          createdAt: true,
        },
      },
    },
  });

  if (!space) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Track widget view
  await prisma.space.update({
    where: { id: spaceId },
    data: { pageViews: { increment: 1 } },
  });

  const showBranding = space.user.plan === "FREE";

  return NextResponse.json(
    {
      space: {
        id: space.id,
        name: space.name,
        primaryColor: space.primaryColor,
      },
      testimonials: space.testimonials,
      branding: showBranding,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
