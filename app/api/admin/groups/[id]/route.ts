import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/server";
import type { GroupRow } from "@/types/database";

const ALLOWED_KEYS = [
  "name",
  "niche",
  "invite_link",
  "member_count",
  "photo_url",
  "status",
  "notes",
] as const satisfies readonly (keyof GroupRow)[];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const body = await request.json();
  const updates: Partial<GroupRow> = {};
  for (const key of ALLOWED_KEYS) {
    if (key in body) updates[key] = body[key];
  }
  updates.last_checked_at = new Date().toISOString();

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("groups").update(updates).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ group: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("groups").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
