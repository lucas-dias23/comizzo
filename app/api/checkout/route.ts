import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSubscriptionCheckout, getProductId, type PlanId } from "@/lib/abacatepay";

export async function POST(request: NextRequest) {
  const { plan, name, taxId, cellphone } = (await request.json()) as {
    plan: PlanId;
    name: string;
    taxId: string;
    cellphone: string;
  };

  if (plan !== "monthly" && plan !== "yearly") {
    return NextResponse.json({ error: "plano inválido" }, { status: 400 });
  }
  if (!name?.trim() || !taxId?.trim() || !cellphone?.trim()) {
    return NextResponse.json({ error: "nome, CPF e telefone são obrigatórios" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  let productId: string;
  try {
    productId = getProductId(plan);
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const origin = request.nextUrl.origin;
  const rawPhone = cellphone.replace(/\D/g, "");
  const formattedPhone = rawPhone.startsWith("55") ? `+${rawPhone}` : `+55${rawPhone}`;

  let checkout;
  try {
    checkout = await createSubscriptionCheckout({
      productId,
      userId: user.id,
      customer: {
        name: name.trim(),
        email: user.email!,
        cellphone: formattedPhone,
        taxId: taxId.replace(/\D/g, ""),
      },
      returnUrl: `${origin}/conta`,
      completionUrl: `${origin}/dashboard?checkout=sucesso`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: `Falha ao criar checkout: ${message}` }, { status: 502 });
  }

  // A assinatura real (subs_...) ainda não existe — será criada só após o
  // pagamento PIX. O ID e plano definitivos chegam via webhook subscription.completed.
  return NextResponse.json({ url: checkout.url });
}
