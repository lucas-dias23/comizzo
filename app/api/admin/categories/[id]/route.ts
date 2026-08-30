import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const { active } = (await request.json()) as { active: boolean };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("categories")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
