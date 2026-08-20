/**
 * POST /.netlify/functions/stripe-webhook
 * Stripe sends events here — verifies signature, then updates Supabase.
 *
 * Events handled:
 *  - checkout.session.completed  → mark user Pro, store stripe_customer_id
 *  - customer.subscription.updated → sync subscription status
 *  - customer.subscription.deleted → revoke Pro
 */
import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const TABLE_FOR: Record<string, string> = {
  athlete: "athletes",
  parent: "parents",
  scout: "scouts",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const sig = event.headers["stripe-signature"];

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return { statusCode: 400, body: `Webhook Error: ${err}` };
  }

  // Service-role client — bypasses RLS so the webhook can write anything
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ── checkout.session.completed ───────────────────────────────────────────────
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    const { userId, userType } = session.metadata ?? {};
    const customerId = session.customer as string;
    if (!userId || !userType) return { statusCode: 400, body: "Missing metadata" };

    const table = TABLE_FOR[userType] ?? "athletes";
    const { data } = await sb.from(table).select("profile").eq("id", userId).single();
    if (data) {
      const updatedProfile = {
        ...data.profile,
        pro: true,
        subscriptionStatus: "active",
        stripeCustomerId: customerId,
      };
      await sb.from(table).update({
        profile: updatedProfile,
        stripe_customer_id: customerId,
        verified: true,
      }).eq("id", userId);
    }
  }

  // ── customer.subscription.updated ───────────────────────────────────────────
  if (stripeEvent.type === "customer.subscription.updated") {
    const sub = stripeEvent.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const status = sub.status; // active | trialing | past_due | canceled | ...
    const isPro = status === "active" || status === "trialing";

    for (const table of ["athletes", "scouts", "parents"]) {
      const { data } = await sb.from(table).select("id, profile").eq("stripe_customer_id", customerId).single();
      if (data) {
        await sb.from(table).update({
          profile: { ...data.profile, pro: isPro, subscriptionStatus: status, stripeCustomerId: customerId },
        }).eq("id", data.id);
        break;
      }
    }
  }

  // ── customer.subscription.deleted ───────────────────────────────────────────
  if (stripeEvent.type === "customer.subscription.deleted") {
    const sub = stripeEvent.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;

    for (const table of ["athletes", "scouts", "parents"]) {
      const { data } = await sb.from(table).select("id, profile").eq("stripe_customer_id", customerId).single();
      if (data) {
        await sb.from(table).update({
          profile: { ...data.profile, pro: false, subscriptionStatus: "cancelled" },
          verified: false,
        }).eq("id", data.id);
        break;
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
