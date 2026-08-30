"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<PlanId>("monthly");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    if (!data.session) {
      setLoading(false);
      setError(
        "Conta criada. Confirme seu e-mail e depois faça login pra continuar com o pagamento."
      );
      return;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, name, taxId: cpf, cellphone: phone }),
    });
    const body = await res.json();

    setLoading(false);
    if (!res.ok || !body.url) {
      setError(body.error ?? "Não foi possível iniciar o pagamento. Tente de novo.");
      return;
    }

    window.location.href = body.url;
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Criar conta.</h1>
      <p className="mb-6 text-sm text-muted">Escolha o plano e comece a vender hoje.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
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

        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
          />
        </div>
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            type="text"
            inputMode="numeric"
            required
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="000.000.000-00"
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefone (WhatsApp)</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            required
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="accent" className="w-full" disabled={loading}>
          {loading ? "Preparando pagamento..." : "Continuar para o pagamento"}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        <span className="text-muted">Já tem conta? </span>
        <Link href="/login" className="text-accent hover:text-accent-hover">
          Entrar
        </Link>
      </div>
    </div>
  );
}
