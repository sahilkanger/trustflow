import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/utils";
import type { Plan } from "@prisma/client";

interface RouteParams {
  params: Promise<{ spaceId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const { spaceId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = PLANS[session.user.plan as Plan];
  if (!plan.analytics) {
    return NextResponse.json(
      { error: "Upgrade to Pro for analytics" },
      { status: 403 }
    );
  }

  const space = await prisma.space.findUnique({
    where: { id: spaceId, userId: session.user.id },
    include: {
      testimonials: {
        select: {
          id: true,
          rating: true,
          status: true,
          sentiment: true,
          source: true,
          createdAt: true,
        },
      },
    },
  });

  if (!space) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const testimonials = space.testimonials;

  // Compute analytics
  const totalTestimonials = testimonials.length;
  const approved = testimonials.filter((t) => t.status === "APPROVED").length;
  const pending = testimonials.filter((t) => t.status === "PENDING").length;

  const withRating = testimonials.filter((t) => t.rating !== null);
  const avgRating =
    withRating.length > 0
      ? withRating.reduce((s, t) => s + (t.rating || 0), 0) / withRating.length
      : null;

  const withSentiment = testimonials.filter((t) => t.sentiment !== null);
  const avgSentiment =
    withSentiment.length > 0
      ? withSentiment.reduce((s, t) => s + (t.sentiment || 0), 0) /
        withSentiment.length
      : null;

  // Source breakdown
  const bySource = testimonials.reduce(
    (acc, t) => {
      acc[t.source] = (acc[t.source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Submissions over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentTestimonials = testimonials.filter(
    (t) => new Date(t.createdAt) >= thirtyDaysAgo
  );

  const dailyCounts: Record<string, number> = {};
  recentTestimonials.forEach((t) => {
    const day = new Date(t.createdAt).toISOString().split("T")[0];
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });

  // Rating distribution
  const ratingDistribution = [0, 0, 0, 0, 0];
  withRating.forEach((t) => {
    if (t.rating) ratingDistribution[t.rating - 1]++;
  });

  return NextResponse.json({
    overview: {
      totalTestimonials,
      approved,
      pending,
      avgRating,
      avgSentiment,
      pageViews: space.pageViews,
      submissions: space.submissions,
      conversionRate:
        space.pageViews > 0
          ? ((space.submissions / space.pageViews) * 100).toFixed(1)
          : "0",
    },
    bySource,
    dailyCounts,
    ratingDistribution,
  });
}
