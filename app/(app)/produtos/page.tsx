import { createClient } from "@/lib/supabase/server";
import { ProdutosClient } from "./produtos-client";

export default async function ProdutosPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: products }, { data: commissions }] = await Promise.all([
    supabase.from("categories").select("id, name").eq("active", true).order("name"),
    supabase.from("products").select("*"),
    supabase.from("category_commissions").select("category_id, commission_pct"),
  ]);

  const commissionMap = Object.fromEntries(
    (commissions ?? []).map((c) => [c.category_id, c.commission_pct])
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Mineração de produtos.</h1>
      <p className="mb-6 text-sm text-muted">
        Encontre. O que vale mais a pena divulgar agora, por categoria.
      </p>

      <ProdutosClient
        categories={categories ?? []}
        products={products ?? []}
        commissionMap={commissionMap}
      />
    </div>
  );
}
