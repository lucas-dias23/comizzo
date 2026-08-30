import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("groups").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ groups: data });
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await request.json();
  const { name, niche, invite_link, member_count, photo_url, notes } = body;

  if (!name || !niche || !invite_link) {
    return NextResponse.json({ error: "nome, nicho e link de convite são obrigatórios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("groups")
    .insert({
      name,
      niche,
      invite_link,
      member_count: member_count ?? null,
      photo_url: photo_url ?? null,
      notes: notes ?? null,
      last_checked_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ group: data });
}
