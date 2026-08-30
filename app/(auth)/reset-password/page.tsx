"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    router.push("/login");
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Nova senha.</h1>
      <p className="mb-6 text-sm text-muted">Escolha uma senha nova pra sua conta.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">Nova senha</Label>
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
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="repita a senha"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="accent" className="w-full" disabled={loading}>
          {loading ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </div>
  );
}
