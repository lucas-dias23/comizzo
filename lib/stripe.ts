import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-08-26.dahlia",
});

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_YEARLY!,
} as const;

export type PlanId = keyof typeof STRIPE_PRICES;

export function planFromPriceId(priceId: string | undefined | null): PlanId | null {
  if (!priceId) return null;
  if (priceId === STRIPE_PRICES.monthly) return "monthly";
  if (priceId === STRIPE_PRICES.yearly) return "yearly";
  return null;
}
