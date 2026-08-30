import { createClient } from "@/lib/supabase/server";
import { ContaClient } from "./conta-client";

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  inactive: "Sem assinatura",
};

export default async function ContaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_plan, current_period_end")
    .eq("id", user!.id)
    .single();

  const status = profile?.subscription_status ?? "inactive";

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-2xl font-semibold">Sua conta.</h1>
      <p className="mb-8 text-sm text-muted">{user?.email}</p>

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted">Status da assinatura</span>
          <span className="text-sm font-medium">{STATUS_LABEL[status]}</span>
        </div>
        {profile?.subscription_plan && (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted">Plano</span>
            <span className="text-sm font-medium">
              {profile.subscription_plan === "monthly" ? "Mensal" : "Anual"}
            </span>
          </div>
        )}
        {profile?.current_period_end && (
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm text-muted">Próxima cobrança</span>
            <span className="text-sm font-medium">
              {new Date(profile.current_period_end).toLocaleDateString("pt-BR")}
            </span>
          </div>
        )}

        <ContaClient hasActiveSubscription={status === "active"} />
      </div>
    </div>
  );
}
