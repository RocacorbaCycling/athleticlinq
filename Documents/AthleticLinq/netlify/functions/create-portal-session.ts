/**
 * POST /.netlify/functions/create-portal-session
 * Body: { stripeCustomerId }
 * Returns: { url } — Stripe Billing Portal URL
 */
import type { Handler } from "@netlify/functions";
import Stripe from "stripe";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const { stripeCustomerId } = JSON.parse(event.body ?? "{}");
  if (!stripeCustomerId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing stripeCustomerId" }) };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const siteUrl = process.env.URL ?? "https://athleticlinq.com";

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${siteUrl}/dashboard`,
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: session.url }),
  };
};
