-- Migra colunas do Stripe para AbacatePay
ALTER TABLE public.profiles
  RENAME COLUMN stripe_customer_id TO abacatepay_customer_id;

ALTER TABLE public.profiles
  RENAME COLUMN stripe_subscription_id TO abacatepay_subscription_id;
