import { createClient } from "@/lib/supabase/server";
import { GruposClient } from "./grupos-client";

export default async function GruposPage() {
  const supabase = await createClient();
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .eq("status", "active")
    .order("niche");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Grupos de divulgação.</h1>
      <p className="mb-6 text-sm text-muted">
        Escolha por nicho e entre direto no grupo. Sem envio automático — você manda a mensagem.
      </p>

      <GruposClient groups={groups ?? []} />
    </div>
  );
}
