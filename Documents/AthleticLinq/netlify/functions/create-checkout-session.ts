/**
 * POST /.netlify/functions/create-checkout-session
 * Body: { userId, userType, email }
 * Returns: { url } — Stripe Checkout redirect URL
 */
import type { Handler } from "@netlify/functions";
import Stripe from "stripe";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  const { userId, userType, email } = JSON.parse(event.body ?? "{}");
  if (!userId || !userType || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const priceId =
    userType === "scout"
      ? process.env.STRIPE_SCOUT_PRICE_ID!
      : process.env.STRIPE_ATHLETE_PRICE_ID!;

  const siteUrl = process.env.URL ?? "https://athleticlinq.com";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?payment=success`,
    cancel_url: `${siteUrl}/dashboard`,
    metadata: { userId, userType },
    subscription_data: {
      metadata: { userId, userType },
      ...(userType === "scout" ? { trial_period_days: 7 } : {}),
    },
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: session.url }),
  };
};
