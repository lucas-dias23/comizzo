"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Entrar.</h1>
      <p className="mb-6 text-sm text-muted">Bora achar produto que vende.</p>

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
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="accent" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="mt-4 flex justify-between text-sm">
        <Link href="/forgot-password" className="text-muted hover:text-foreground">
          Esqueceu sua senha?
        </Link>
        <Link href="/signup" className="text-accent hover:text-accent-hover">
          Criar conta
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
