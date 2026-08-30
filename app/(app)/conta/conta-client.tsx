"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/stripe";

const PLANS: { id: PlanId; label: string; hint: string }[] = [
  { id: "monthly", label: "Mensal", hint: "cobrança todo mês" },
  { id: "yearly", label: "Anual", hint: "2 meses grátis no ano" },
];

export function ContaClient({ hasActiveSubscription }: { hasActiveSubscription: boolean }) {
  const [plan, setPlan] = useState<PlanId>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function goToCheckout() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok || !body.url) {
      setError(body.error ?? "Não deu pra iniciar o pagamento.");
      return;
    }
    window.location.href = body.url;
  }

  async function openBillingPortal() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/billing-portal", { method: "POST" });
    const body = await res.json();
    setLoading(false);
    if (!res.ok || !body.url) {
      setError(body.error ?? "Não deu pra abrir o portal de cobrança.");
      return;
    }
    window.location.href = body.url;
  }

  if (hasActiveSubscription) {
    return (
      <>
        <Button variant="outline" className="w-full" onClick={openBillingPortal} disabled={loading}>
          {loading ? "Abrindo..." : "Gerenciar assinatura"}
        </Button>
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </>
    );
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlan(p.id)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              plan === p.id
                ? "border-accent bg-accent/10"
                : "border-border bg-background hover:bg-surface-hover"
            )}
          >
            <div className="text-sm font-semibold">{p.label}</div>
            <div className="text-xs text-muted">{p.hint}</div>
          </button>
        ))}
      </div>
      <Button variant="accent" className="w-full" onClick={goToCheckout} disabled={loading}>
        {loading ? "Preparando..." : "Assinar agora"}
      </Button>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </>
  );
}
