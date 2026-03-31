"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown } from "lucide-react";

const plans = [
  {
    key: "FREE",
    name: "Free",
    icon: Zap,
    price: "$0",
    period: "forever",
    features: [
      "1 space",
      "10 testimonials",
      "Tweet import",
      "Wall of Love embed",
      "Collection page",
      "TrustFlow branding on widget",
    ],
  },
  {
    key: "PRO",
    name: "Pro",
    icon: Crown,
    price: "$29",
    period: "/month",
    popular: true,
    features: [
      "3 spaces",
      "Unlimited testimonials",
      "Remove TrustFlow branding",
      "Unlimited tweet imports",
      "Priority support",
    ],
  },
];

export default function BillingPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan = session?.user?.plan || "FREE";
  const success = searchParams.get("success");

  async function handleUpgrade(plan: string) {
    if (plan === "FREE" || plan === currentPlan) return;
    setLoading(plan);

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();
    setLoading(null);

    if (data.url) {
      window.location.href = data.url;
    }
  }

  async function handleManage() {
    setLoading("manage");
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    setLoading(null);

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 mb-8">
          <p className="text-emerald-800 font-medium">
            Your subscription is now active. Welcome to TrustFlow{" "}
            {currentPlan}!
          </p>
        </div>
      )}

      {/* Current plan */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Current Plan</CardTitle>
          <CardDescription>
            You are on the{" "}
            <span className="font-semibold text-foreground">
              {currentPlan}
            </span>{" "}
            plan
          </CardDescription>
        </CardHeader>
        {currentPlan !== "FREE" && (
          <CardContent>
            <Button variant="outline" onClick={handleManage} disabled={loading === "manage"}>
              {loading === "manage" ? "Loading..." : "Manage subscription"}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          return (
            <Card
              key={plan.key}
              className={
                plan.popular
                  ? "border-primary shadow-md ring-1 ring-primary relative"
                  : ""
              }
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <plan.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button disabled className="w-full" variant="outline">
                    Current plan
                  </Button>
                ) : plan.key === "FREE" ? (
                  <Button disabled className="w-full" variant="outline">
                    Free forever
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={loading === plan.key}
                  >
                    {loading === plan.key ? "Loading..." : "Upgrade"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
