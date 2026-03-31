import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, MessageSquare, Eye } from "lucide-react";
import { PLANS } from "@/lib/utils";
import type { Plan } from "@prisma/client";

export default async function SpacesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const spaces = await prisma.space.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { testimonials: true, widgets: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const plan = PLANS[session.user.plan as Plan];
  const canCreate = spaces.length < plan.maxSpaces;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Spaces</h1>
          <p className="text-muted-foreground mt-1">
            Each space collects testimonials for a product or business
          </p>
        </div>
        {canCreate ? (
          <Link href="/spaces/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Space
            </Button>
          </Link>
        ) : (
          <Link href="/billing">
            <Button variant="outline">Upgrade for more spaces</Button>
          </Link>
        )}
      </div>

      {spaces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No spaces yet</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              Create your first space to start collecting and displaying
              testimonials
            </p>
            <Link href="/spaces/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create your first space
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <Link key={space.id} href={`/spaces/${space.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{space.name}</CardTitle>
                    {space.website && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  {space.description && (
                    <CardDescription className="line-clamp-2">
                      {space.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {space._count.testimonials} testimonials
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {space.pageViews} views
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="secondary">
                      /{space.slug}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
