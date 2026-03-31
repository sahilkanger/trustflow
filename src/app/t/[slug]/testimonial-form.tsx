"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface TestimonialFormProps {
  slug: string;
  questionPrompt: string;
  thankYouMessage: string;
  collectRating: boolean;
  primaryColor: string;
}

export function TestimonialForm({
  slug,
  questionPrompt,
  thankYouMessage,
  collectRating,
  primaryColor,
}: TestimonialFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      text: form.get("text") as string,
      authorName: form.get("authorName") as string,
      authorEmail: form.get("authorEmail") as string,
      authorTitle: form.get("authorTitle") as string,
      authorCompany: form.get("authorCompany") as string,
      rating: collectRating && rating > 0 ? rating : undefined,
    };

    const res = await fetch(`/api/collect/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Something went wrong");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white shadow-lg border p-8 text-center animate-fade-in">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <svg
            className="h-8 w-8"
            style={{ color: primaryColor }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Thank you!
        </h2>
        <p className="text-gray-600">{thankYouMessage}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white shadow-lg border p-8 space-y-5"
    >
      <h2 className="text-lg font-semibold text-gray-900">
        {questionPrompt}
      </h2>

      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      {/* Star Rating */}
      {collectRating && (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Testimonial Text */}
      <div>
        <textarea
          name="text"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder="Share your experience..."
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
          style={
            { "--tw-ring-color": primaryColor } as React.CSSProperties
          }
        />
      </div>

      {/* Author Details */}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="authorName"
          required
          maxLength={100}
          placeholder="Your name *"
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={
            { "--tw-ring-color": primaryColor } as React.CSSProperties
          }
        />
        <input
          name="authorEmail"
          type="email"
          maxLength={100}
          placeholder="Email (optional)"
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={
            { "--tw-ring-color": primaryColor } as React.CSSProperties
          }
        />
        <input
          name="authorTitle"
          maxLength={100}
          placeholder="Job title (optional)"
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={
            { "--tw-ring-color": primaryColor } as React.CSSProperties
          }
        />
        <input
          name="authorCompany"
          maxLength={100}
          placeholder="Company (optional)"
          className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={
            { "--tw-ring-color": primaryColor } as React.CSSProperties
          }
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {loading ? "Submitting..." : "Submit Testimonial"}
      </button>
    </form>
  );
}
