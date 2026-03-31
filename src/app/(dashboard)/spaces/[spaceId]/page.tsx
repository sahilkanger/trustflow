import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ExternalLink,
  Copy,
  Star,
  MessageSquare,
  Code,
  Send,
} from "lucide-react";
import { absoluteUrl } from "@/lib/utils";
import { TestimonialList } from "./testimonial-list";
import { TweetImport } from "./tweet-import";

interface SpacePageProps {
  params: Promise<{ spaceId: string }>;
}

export default async function SpacePage({ params }: SpacePageProps) {
  const { spaceId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const space = await prisma.space.findUnique({
    where: { id: spaceId, userId: session.user.id },
    include: {
      testimonials: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          testimonials: true,
          widgets: true,
        },
      },
    },
  });

  if (!space) notFound();

  const collectionUrl = absoluteUrl(`/t/${space.slug}`);
  const embedUrl = absoluteUrl(`/embed/${space.id}`);

  const approvedCount = space.testimonials.filter(
    (t) => t.status === "APPROVED"
  ).length;
  const pendingCount = space.testimonials.filter(
    (t) => t.status === "PENDING"
  ).length;
  const avgRating =
    space.testimonials.filter((t) => t.rating).length > 0
      ? (
          space.testimonials
            .filter((t) => t.rating)
            .reduce((sum, t) => sum + (t.rating || 0), 0) /
          space.testimonials.filter((t) => t.rating).length
        ).toFixed(1)
      : "N/A";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{space.name}</h1>
          {space.description && (
            <p className="text-muted-foreground mt-1">{space.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={collectionUrl} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Collection Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Tweet Import — the killer feature */}
      <div className="mb-8">
        <TweetImport spaceId={space.id} />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Collection Link</p>
                <p className="text-xs text-muted-foreground">
                  Share to collect testimonials
                </p>
              </div>
            </div>
            <code className="block rounded bg-white/80 px-3 py-2 text-xs break-all">
              {collectionUrl}
            </code>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Embed Widget</p>
                <p className="text-xs text-muted-foreground">
                  Add to your website (JS snippet)
                </p>
              </div>
            </div>
            <code className="block rounded bg-white/80 px-3 py-2 text-xs break-all">
              {`<script src="${absoluteUrl("/api/embed/script.js")}" data-space-id="${space.id}"></script>`}
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Or use iframe: <code className="text-[10px]">{`<iframe src="${embedUrl}" width="100%" height="600"></iframe>`}</code>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{avgRating}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>
            Manage and approve testimonials for this space
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TestimonialList
            testimonials={space.testimonials.map((t) => ({
              ...t,
              tags: t.tags,
            }))}
            spaceId={space.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
