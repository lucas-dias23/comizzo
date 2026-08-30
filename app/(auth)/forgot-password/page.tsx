"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div>
        <h1 className="mb-1 text-xl font-semibold">Confira seu e-mail.</h1>
        <p className="text-sm text-muted">
          Se {email} tiver uma conta, mandamos um link pra redefinir a senha.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-accent hover:text-accent-hover">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Esqueceu sua senha?</h1>
      <p className="mb-6 text-sm text-muted">Manda seu e-mail que a gente resolve.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="accent" className="w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar link de recuperação"}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link href="/login" className="text-muted hover:text-foreground">
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
