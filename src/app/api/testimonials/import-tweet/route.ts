import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/utils";
import { z } from "zod";
import type { Plan } from "@prisma/client";

const importTweetSchema = z.object({
  spaceId: z.string().min(1),
  tweetUrl: z.string().url().refine(
    (url) => {
      const parsed = new URL(url);
      return (
        (parsed.hostname === "twitter.com" ||
          parsed.hostname === "x.com" ||
          parsed.hostname === "www.twitter.com" ||
          parsed.hostname === "www.x.com") &&
        /\/status\/\d+/.test(parsed.pathname)
      );
    },
    { message: "Must be a valid Twitter/X tweet URL (e.g. https://x.com/user/status/123)" }
  ),
});

function extractTweetId(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = importTweetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { spaceId, tweetUrl } = parsed.data;

  // Verify ownership
  const space = await prisma.space.findUnique({
    where: { id: spaceId, userId: session.user.id },
    include: { _count: { select: { testimonials: true } } },
  });

  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  // Check testimonial limits
  const plan = PLANS[session.user.plan as Plan];
  if (space._count.testimonials >= plan.maxTestimonials) {
    return NextResponse.json(
      { error: "Testimonial limit reached. Upgrade to Pro for unlimited." },
      { status: 403 }
    );
  }

  const tweetId = extractTweetId(tweetUrl);
  if (!tweetId) {
    return NextResponse.json(
      { error: "Could not extract tweet ID from URL" },
      { status: 400 }
    );
  }

  // Check for duplicate import
  const existing = await prisma.testimonial.findUnique({
    where: { tweetId },
  });

  if (existing) {
    return NextResponse.json(
      { error: "This tweet has already been imported" },
      { status: 409 }
    );
  }

  // Fetch tweet data using Twitter's syndication API (no auth required)
  let tweetData;
  try {
    const res = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=0`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch tweet. It may be private or deleted." },
        { status: 404 }
      );
    }

    tweetData = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tweet data. Please try again." },
      { status: 502 }
    );
  }

  // Extract tweet content
  const text = tweetData.text;
  const authorName = tweetData.user?.name || "Unknown";
  const authorHandle = tweetData.user?.screen_name || "";
  const authorAvatar = tweetData.user?.profile_image_url_https?.replace(
    "_normal",
    "_200x200"
  ) || null;

  if (!text) {
    return NextResponse.json(
      { error: "Could not extract text from tweet" },
      { status: 422 }
    );
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      spaceId,
      text,
      authorName,
      authorTitle: authorHandle ? `@${authorHandle}` : null,
      authorAvatar,
      source: "TWITTER",
      tweetId,
      tweetUrl,
      status: "PENDING",
    },
  });

  return NextResponse.json(testimonial, { status: 201 });
}
