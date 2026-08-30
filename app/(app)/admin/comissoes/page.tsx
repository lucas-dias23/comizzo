import { createAdminClient } from "@/lib/supabase/server";
import { AdminComissoesClient } from "./admin-comissoes-client";

export default async function AdminComissoesPage() {
  const supabase = createAdminClient();
  const [{ data: categories }, { data: commissions }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("category_commissions").select("*"),
  ]);

  const commissionMap = Object.fromEntries((commissions ?? []).map((c) => [c.category_id, c]));
  const merged = (categories ?? []).map((c) => ({
    ...c,
    commission_pct: commissionMap[c.id]?.commission_pct ?? null,
  }));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Comissões — painel admin.</h1>
      <p className="mb-6 text-sm text-muted">
        O Mercado Livre publica a % de comissão por categoria fora da API pública — cadastre
        aqui pra alimentar o score de prioridade. Categorias inativas não aparecem como aba
        em Produtos.
      </p>
      <AdminComissoesClient initialCategories={merged} />
    </div>
  );
}
