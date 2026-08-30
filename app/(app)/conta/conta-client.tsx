"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/abacatepay";

const PLANS: { id: PlanId; label: string; hint: string }[] = [
  { id: "monthly", label: "Mensal", hint: "cobrança todo mês" },
  { id: "yearly", label: "Anual", hint: "2 meses grátis no ano" },
];

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

export function ContaClient({ hasActiveSubscription }: { hasActiveSubscription: boolean }) {
  const [plan, setPlan] = useState<PlanId>("monthly");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [canceled, setCanceled] = useState(false);

  async function goToCheckout() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, name, taxId: cpf, cellphone: phone }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok || !body.url) {
      setError(body.error ?? "Não deu pra iniciar o pagamento.");
      return;
    }
    window.location.href = body.url;
  }

  async function cancelSubscription() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/billing-portal", { method: "POST" });
    const body = await res.json();
    setLoading(false);
    if (!res.ok || !body.ok) {
      setError(body.error ?? "Não foi possível cancelar.");
      return;
    }
    setCanceled(true);
    setCancelConfirm(false);
  }

  if (hasActiveSubscription) {
    if (canceled) {
      return <p className="text-sm text-muted">Assinatura cancelada. Seu acesso foi encerrado.</p>;
    }
    if (cancelConfirm) {
      return (
        <>
          <p className="mb-4 text-sm text-muted">
            Tem certeza? Seu acesso será encerrado imediatamente.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCancelConfirm(false)}
              disabled={loading}
            >
              Voltar
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-danger text-danger hover:bg-danger/10"
              onClick={cancelSubscription}
              disabled={loading}
            >
              {loading ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </>
      );
    }
    return (
      <>
        <Button
          variant="outline"
          className="w-full text-danger border-danger/30 hover:bg-danger/5"
          onClick={() => setCancelConfirm(true)}
          disabled={loading}
        >
          Cancelar assinatura
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

      <div className="mb-3 space-y-3">
        <div>
          <Label htmlFor="checkout-name">Nome completo</Label>
          <Input
            id="checkout-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <Label htmlFor="checkout-cpf">CPF</Label>
          <Input
            id="checkout-cpf"
            type="text"
            inputMode="numeric"
            required
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="000.000.000-00"
          />
        </div>
        <div>
          <Label htmlFor="checkout-phone">Telefone (WhatsApp)</Label>
          <Input
            id="checkout-phone"
            type="tel"
            inputMode="numeric"
            required
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <Button variant="accent" className="w-full" onClick={goToCheckout} disabled={loading}>
        {loading ? "Preparando pagamento..." : "Assinar agora"}
      </Button>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </>
  );
}
