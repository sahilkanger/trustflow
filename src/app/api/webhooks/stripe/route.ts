import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import type { Plan } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as Plan;

      if (!userId || !plan) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: session.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (!subscriptionId) break;

      const subscription =
        await stripe.subscriptions.retrieve(subscriptionId);
      const plan = subscription.metadata?.plan as Plan;

      if (!plan) break;

      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          plan,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan: "FREE",
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const plan = subscription.metadata?.plan as Plan;

      if (!plan) break;

      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
