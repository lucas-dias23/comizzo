import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const supabase = createAdminClient();
  const [{ data: categories, error: catError }, { data: commissions, error: comError }] =
    await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("category_commissions").select("*"),
    ]);

  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 });
  if (comError) return NextResponse.json({ error: comError.message }, { status: 500 });

  const commissionMap = Object.fromEntries((commissions ?? []).map((c) => [c.category_id, c]));
  const merged = (categories ?? []).map((c) => ({
    ...c,
    commission_pct: commissionMap[c.id]?.commission_pct ?? null,
  }));

  return NextResponse.json({ categories: merged });
}

export async function PUT(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { categoryId, commissionPct } = (await request.json()) as {
    categoryId: string;
    commissionPct: number;
  };

  if (!categoryId || commissionPct == null || commissionPct < 0 || commissionPct > 100) {
    return NextResponse.json({ error: "categoryId e commissionPct (0-100) são obrigatórios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("category_commissions").upsert({
    category_id: categoryId,
    commission_pct: commissionPct,
    updated_at: new Date().toISOString(),
    updated_by: guard.user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
