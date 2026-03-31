import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Eye,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [spaces, totalTestimonials, recentTestimonials] = await Promise.all([
    prisma.space.findMany({
      where: { userId: session.user.id },
      include: { _count: { select: { testimonials: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.testimonial.count({
      where: { space: { userId: session.user.id } },
    }),
    prisma.testimonial.findMany({
      where: { space: { userId: session.user.id } },
      include: { space: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalViews = spaces.reduce((sum, s) => sum + s.pageViews, 0);
  const pendingCount = await prisma.testimonial.count({
    where: {
      space: { userId: session.user.id },
      status: "PENDING",
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.user.name?.split(" ")[0]}
          </p>
        </div>
        <Link href="/spaces/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Space
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Testimonials
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTestimonials}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Page Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Spaces
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spaces.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Your Spaces */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Spaces</CardTitle>
          </CardHeader>
          <CardContent>
            {spaces.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Create your first space to start collecting testimonials
                </p>
                <Link href="/spaces/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Space
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {spaces.map((space) => (
                  <Link
                    key={space.id}
                    href={`/spaces/${space.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium">{space.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {space._count.testimonials} testimonials
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Testimonials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTestimonials.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No testimonials yet. Share your collection link to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {recentTestimonials.map((t) => (
                  <div key={t.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {t.authorName}
                      </span>
                      <Badge
                        variant={
                          t.status === "APPROVED"
                            ? "success"
                            : t.status === "PENDING"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {t.status.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {t.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.space.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
