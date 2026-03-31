"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  text: string;
  rating: number | null;
  authorName: string;
  authorTitle: string | null;
  authorCompany: string | null;
  authorAvatar: string | null;
  highlighted: boolean;
  createdAt: string;
}

interface WidgetData {
  space: { id: string; name: string; primaryColor: string };
  testimonials: Testimonial[];
  branding: boolean;
}

export default function EmbedPage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const [data, setData] = useState<WidgetData | null>(null);
  const [error, setError] = useState(false);
  const [spaceId, setSpaceId] = useState<string>("");

  useEffect(() => {
    params.then((p) => setSpaceId(p.spaceId));
  }, [params]);

  useEffect(() => {
    if (!spaceId) return;
    fetch(`/api/widget/${spaceId}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [spaceId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Widget not found
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-500" />
      </div>
    );
  }

  const { space, testimonials, branding } = data;

  return (
    <div className="min-h-screen bg-transparent p-4">
      {/* Wall of Love Layout */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="break-inside-avoid rounded-xl border bg-white p-5 shadow-sm"
          >
            {/* Rating */}
            {t.rating && (
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < t.rating!
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Text */}
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: space.primaryColor }}
              >
                {t.authorAvatar ? (
                  <img
                    src={t.authorAvatar}
                    alt={t.authorName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  t.authorName[0]?.toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t.authorName}
                </p>
                {(t.authorTitle || t.authorCompany) && (
                  <p className="text-xs text-gray-500">
                    {t.authorTitle}
                    {t.authorTitle && t.authorCompany && " at "}
                    {t.authorCompany}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No testimonials to display yet
        </div>
      )}

      {/* VIRAL ENGINE — "Powered by TrustFlow" */}
      {branding && (
        <div className="text-center mt-8 pb-4">
          <a
            href="https://trustflow.app?ref=embed"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:shadow-sm transition-all"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded bg-indigo-500 text-white text-[8px] font-bold">
              T
            </span>
            Powered by TrustFlow
          </a>
        </div>
      )}
    </div>
  );
}
