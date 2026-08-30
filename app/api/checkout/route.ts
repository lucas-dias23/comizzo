import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRICES, type PlanId } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const { plan } = (await request.json()) as { plan: PlanId };

  if (plan !== "monthly" && plan !== "yearly") {
    return NextResponse.json({ error: "plano inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const origin = request.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : user.email,
    client_reference_id: user.id,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
    line_items: [{ price: STRIPE_PRICES[plan], quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=sucesso`,
    cancel_url: `${origin}/conta?checkout=cancelado`,
  });

  return NextResponse.json({ url: session.url });
}
