import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCategories, getCategoryHighlights } from "@/lib/meli/client";

export const maxDuration = 60;

// Chamado pelo Vercel Cron (ver vercel.json). Atualiza a lista de categorias
// do ML e recarrega o top 20 highlights de cada categoria marcada como ativa.
// Não sobrescreve `categories.active` (isso é curadoria manual do admin).
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const meliCategories = await getCategories();
  await supabase
    .from("categories")
    .upsert(
      meliCategories.map((c) => ({ id: c.id, name: c.name })),
      { onConflict: "id", ignoreDuplicates: true }
    );

  const { data: activeCategories, error } = await supabase
    .from("categories")
    .select("id")
    .eq("active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { categoryId: string; count: number; error?: string }[] = [];

  for (const category of activeCategories ?? []) {
    try {
      const products = await getCategoryHighlights(category.id);

      await supabase.from("products").delete().eq("category_id", category.id);
      if (products.length > 0) {
        await supabase.from("products").insert(
          products.map((p) => ({
            item_id: p.itemId,
            category_id: p.categoryId,
            title: p.title,
            thumbnail: p.thumbnail,
            price: p.price,
            permalink: p.permalink,
            sold_quantity: p.soldQuantity,
            rank_position: p.rankPosition,
          }))
        );
      }
      results.push({ categoryId: category.id, count: products.length });
    } catch (err) {
      results.push({
        categoryId: category.id,
        count: 0,
        error: err instanceof Error ? err.message : "erro desconhecido",
      });
    }
  }

  return NextResponse.json({ refreshedAt: new Date().toISOString(), results });
}
