import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submitTestimonialSchema } from "@/lib/validations";
import { PLANS } from "@/lib/utils";
import { analyzeSentiment } from "@/lib/sentiment";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { Plan } from "@prisma/client";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// Public endpoint — no auth required (this is how customers submit testimonials)
export async function POST(req: Request, { params }: RouteParams) {
  // Rate limit: 5 submissions per minute per IP
  const ip = getClientIp(req);
  const { success } = rateLimit(`collect:${ip}`, 5, 60 * 1000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { slug } = await params;

  const space = await prisma.space.findUnique({
    where: { slug },
    include: {
      user: { select: { plan: true } },
      _count: { select: { testimonials: true } },
    },
  });

  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  // Check testimonial limits
  const plan = PLANS[space.user.plan as Plan];
  if (space._count.testimonials >= plan.maxTestimonials) {
    return NextResponse.json(
      { error: "This space has reached its testimonial limit" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = submitTestimonialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  // AI sentiment analysis — the system learns from every submission
  const { score: sentiment, summary } = analyzeSentiment(parsed.data.text);

  const testimonial = await prisma.testimonial.create({
    data: {
      ...parsed.data,
      authorEmail: parsed.data.authorEmail || null,
      authorTitle: parsed.data.authorTitle || null,
      authorCompany: parsed.data.authorCompany || null,
      spaceId: space.id,
      status: space.requireApproval ? "PENDING" : "APPROVED",
      source: "FORM",
      sentiment,
      summary,
    },
  });

  // Increment submission counter
  await prisma.space.update({
    where: { id: space.id },
    data: { submissions: { increment: 1 } },
  });

  return NextResponse.json(
    { success: true, id: testimonial.id },
    { status: 201 }
  );
}
