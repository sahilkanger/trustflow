"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X, Archive } from "lucide-react";

interface Testimonial {
  id: string;
  text: string;
  rating: number | null;
  authorName: string;
  authorEmail: string | null;
  authorTitle: string | null;
  authorCompany: string | null;
  status: string;
  highlighted: boolean;
  tags: string[];
  sentiment: number | null;
  summary: string | null;
  createdAt: Date;
}

interface TestimonialListProps {
  testimonials: Testimonial[];
  spaceId: string;
}

export function TestimonialList({
  testimonials,
  spaceId,
}: TestimonialListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("ALL");

  const filtered =
    filter === "ALL"
      ? testimonials
      : testimonials.filter((t) => t.status === filter);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function toggleHighlight(id: string, highlighted: boolean) {
    await fetch(`/api/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ highlighted: !highlighted }),
    });
    router.refresh();
  }

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No testimonials yet. Share your collection link to get started!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
            {status !== "ALL" && (
              <span className="ml-1.5 text-xs opacity-70">
                {testimonials.filter((t) =>
                  status === "ALL" ? true : t.status === status
                ).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Testimonial Cards */}
      <div className="space-y-4">
        {filtered.map((testimonial) => (
          <div
            key={testimonial.id}
            className="rounded-lg border p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">
                    {testimonial.authorName}
                  </span>
                  {testimonial.authorTitle && (
                    <span className="text-sm text-muted-foreground">
                      {testimonial.authorTitle}
                      {testimonial.authorCompany &&
                        ` at ${testimonial.authorCompany}`}
                    </span>
                  )}
                  <Badge
                    variant={
                      testimonial.status === "APPROVED"
                        ? "success"
                        : testimonial.status === "PENDING"
                        ? "warning"
                        : testimonial.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {testimonial.status.toLowerCase()}
                  </Badge>
                  {testimonial.highlighted && (
                    <Badge variant="default">Featured</Badge>
                  )}
                </div>

                {/* Rating */}
                {testimonial.rating && (
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating!
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <p className="text-sm leading-relaxed">{testimonial.text}</p>

                {testimonial.sentiment !== null && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Sentiment:{" "}
                    {testimonial.sentiment > 0.3
                      ? "Positive"
                      : testimonial.sentiment < -0.3
                      ? "Negative"
                      : "Neutral"}{" "}
                    ({(testimonial.sentiment * 100).toFixed(0)}%)
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-4">
                {testimonial.status === "PENDING" && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() =>
                        updateStatus(testimonial.id, "APPROVED")
                      }
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() =>
                        updateStatus(testimonial.id, "REJECTED")
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() =>
                    toggleHighlight(testimonial.id, testimonial.highlighted)
                  }
                >
                  <Star
                    className={`h-4 w-4 ${
                      testimonial.highlighted
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() =>
                    updateStatus(testimonial.id, "ARCHIVED")
                  }
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
