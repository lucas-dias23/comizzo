import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { stripe, planFromPriceId } from "@/lib/stripe";
import type { SubscriptionStatus } from "@/types/database";

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    default:
      return "canceled";
  }
}

async function syncSubscription(subscription: Stripe.Subscription, userId?: string) {
  const supabase = createAdminClient();
  const priceId = subscription.items.data[0]?.price.id;
  const item = subscription.items.data[0];

  const updates = {
    stripe_subscription_id: subscription.id,
    subscription_status: mapStripeStatus(subscription.status),
    subscription_plan: planFromPriceId(priceId),
    current_period_end: item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
  };

  const targetUserId = userId ?? subscription.metadata.user_id;
  if (!targetUserId) return;

  await supabase.from("profiles").update(updates).eq("id", targetUserId);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: `assinatura inválida: ${message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.user_id;
      if (userId && session.customer) {
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: session.customer as string })
          .eq("id", userId);
      }
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        await syncSubscription(subscription, userId ?? undefined);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
