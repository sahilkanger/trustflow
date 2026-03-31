import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import type { Plan } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { plan } = body as { plan: "PRO" };

  if (plan !== "PRO" || !STRIPE_PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // If user already has a subscription, create a billing portal session to manage it
  if (user.stripeSubscriptionId) {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId!,
      return_url: absoluteUrl("/billing"),
    });

    return NextResponse.json({ url: portalSession.url });
  }

  // Create or retrieve Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.name || undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  // Create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: STRIPE_PLANS[plan], quantity: 1 }],
    success_url: absoluteUrl("/billing?success=true"),
    cancel_url: absoluteUrl("/billing?canceled=true"),
    metadata: { userId: session.user.id, plan },
    subscription_data: {
      metadata: { userId: session.user.id, plan },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
