"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewSpacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      website: formData.get("website") as string,
      description: formData.get("description") as string,
    };

    const res = await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to create space");
      setLoading(false);
      return;
    }

    const space = await res.json();
    router.push(`/spaces/${space.id}`);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Create a new Space</h1>
      <p className="text-muted-foreground mb-8">
        A space is a project or business you want to collect testimonials for
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Space Details</CardTitle>
          <CardDescription>
            This information will appear on your public collection page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Space Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="My Awesome Product"
                required
              />
              <p className="text-xs text-muted-foreground">
                This will generate your public collection URL
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://myproduct.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A brief description of your product or service"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Space"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
