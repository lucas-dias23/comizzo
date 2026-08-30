import { createAdminClient } from "@/lib/supabase/server";
import { AdminGruposClient } from "./admin-grupos-client";

export default async function AdminGruposPage() {
  const supabase = createAdminClient();
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Grupos — painel admin.</h1>
      <p className="mb-6 text-sm text-muted">
        Depois da checagem manual semanal, adicione, edite ou desative os grupos aqui.
      </p>
      <AdminGruposClient initialGroups={groups ?? []} />
    </div>
  );
}
