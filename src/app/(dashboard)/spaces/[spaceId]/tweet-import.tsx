"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Twitter } from "lucide-react";

interface TweetImportProps {
  spaceId: string;
}

export function TweetImport({ spaceId }: TweetImportProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/testimonials/import-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spaceId, tweetUrl: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to import tweet");
        return;
      }

      setSuccess(true);
      setUrl("");
      router.refresh();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white">
          <Twitter className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-sm">Import from Twitter/X</p>
          <p className="text-xs text-muted-foreground">
            Paste a tweet URL to turn it into a testimonial
          </p>
        </div>
      </div>
      <form onSubmit={handleImport} className="flex gap-2">
        <Input
          type="url"
          placeholder="https://x.com/user/status/123456789"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          className="flex-1 bg-white"
          disabled={loading}
        />
        <Button type="submit" size="sm" disabled={loading || !url.trim()}>
          {loading ? "Importing..." : "Import"}
        </Button>
      </form>
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
      {success && (
        <p className="text-xs text-emerald-600 mt-2">
          Tweet imported! Check pending testimonials below.
        </p>
      )}
    </div>
  );
}
