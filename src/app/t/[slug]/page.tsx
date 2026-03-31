import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { TestimonialForm } from "./testimonial-form";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;

  const space = await prisma.space.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!space) return {};

  return {
    title: `Share your experience with ${space.name} | TrustFlow`,
    description:
      space.description || `Leave a testimonial for ${space.name}`,
  };
}

export default async function CollectionPage({
  params,
}: CollectionPageProps) {
  const { slug } = await params;

  const space = await prisma.space.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      primaryColor: true,
      thankYouMessage: true,
      questionPrompt: true,
      collectRating: true,
      user: { select: { plan: true } },
    },
  });

  if (!space) notFound();

  // Track page view
  await prisma.space.update({
    where: { slug },
    data: { pageViews: { increment: 1 } },
  });

  const showBranding = space.user.plan === "FREE";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${space.primaryColor}10, ${space.primaryColor}05, white)`,
      }}
    >
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          {space.logo && (
            <img
              src={space.logo}
              alt={space.name}
              className="h-12 w-12 mx-auto mb-4 rounded-lg"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900">{space.name}</h1>
          {space.description && (
            <p className="text-gray-600 mt-2">{space.description}</p>
          )}
        </div>

        <TestimonialForm
          slug={space.slug}
          questionPrompt={space.questionPrompt}
          thankYouMessage={space.thankYouMessage}
          collectRating={space.collectRating}
          primaryColor={space.primaryColor}
        />

        {/* Viral branding — the growth engine */}
        {showBranding && (
          <div className="text-center mt-8">
            <a
              href="https://trustflow.app?ref=widget"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded bg-indigo-500 text-white text-[8px] font-bold">
                T
              </span>
              Powered by TrustFlow
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
