import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { SubscriptionStatus, SubscriptionPlan } from "@/types/database";

// TODO: quando confirmarmos como funciona de verdade a assinatura HMAC de
// webhook do AbacatePay (o header `x-webhook-signature`), trocar essa
// checagem por verificação de assinatura. Por ora, a única defesa é o
// `webhookSecret` que você mesmo configura na URL do webhook no painel deles.
function isValidWebhookSecret(provided: string | null): boolean {
  const expected = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

type WebhookPayload = {
  id: string;
  event: string;
  apiVersion: number;
  devMode: boolean;
  data: {
    id: string;                        // subs_... (só presente após pagamento)
    status: string;
    nextBilling: string | null;
    product: {
      id: string;
      externalId: string;
      cycle: string;                   // "MONTHLY" | "YEARLY"
    } | null;
    customer: { id: string } | null;
    metadata: { user_id?: string } | null;
  };
};

function planFromCycle(cycle: string | undefined): SubscriptionPlan | null {
  switch (cycle?.toUpperCase()) {
    case "MONTHLY": return "monthly";
    case "YEARLY": return "yearly";
    default: return null;
  }
}

function statusFromAbacate(status: string): SubscriptionStatus {
  switch (status?.toUpperCase()) {
    case "ACTIVE": return "active";
    case "CANCELLED":
    case "EXPIRED":
    case "FAILED": return "canceled";
    default: return "inactive";
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  const querySecret = request.nextUrl.searchParams.get("webhookSecret");
  if (!isValidWebhookSecret(querySecret)) {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
  }

  let event: WebhookPayload;
  try {
    event = JSON.parse(body) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const userId = event.data?.metadata?.user_id;
  if (!userId) return NextResponse.json({ received: true });

  switch (event.event) {
    case "subscription.completed": {
      // Primeira ativação: salva o ID real da assinatura, o plano e ativa o usuário.
      await supabase
        .from("profiles")
        .update({
          abacatepay_subscription_id: event.data.id,
          subscription_status: "active",
          subscription_plan: planFromCycle(event.data.product?.cycle ?? undefined),
          current_period_end: event.data.nextBilling ?? null,
        })
        .eq("id", userId);
      break;
    }
    case "subscription.renewed": {
      // Renovação: só atualiza próxima data de cobrança.
      await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          current_period_end: event.data.nextBilling ?? null,
        })
        .eq("id", userId);
      break;
    }
    case "subscription.cancelled": {
      await supabase
        .from("profiles")
        .update({ subscription_status: statusFromAbacate(event.data.status) })
        .eq("id", userId);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
