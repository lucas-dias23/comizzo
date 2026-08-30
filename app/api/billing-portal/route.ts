import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ subscription_status: "canceled" })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Não foi possível cancelar a assinatura." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
