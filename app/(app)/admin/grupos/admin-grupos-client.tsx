"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/database";

type GroupRow = Database["public"]["Tables"]["groups"]["Row"];

const emptyForm = { name: "", niche: "", invite_link: "", member_count: "", photo_url: "" };

export function AdminGruposClient({ initialGroups }: { initialGroups: GroupRow[] }) {
  const [groups, setGroups] = useState<GroupRow[]>(initialGroups);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    const res = await fetch("/api/admin/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        member_count: form.member_count ? Number(form.member_count) : null,
      }),
    });
    const body = await res.json();

    setCreating(false);
    if (!res.ok) {
      setError(body.error);
      return;
    }
    setGroups((prev) => [body.group, ...prev]);
    setForm(emptyForm);
  }

  async function toggleStatus(group: GroupRow) {
    const nextStatus = group.status === "active" ? "inactive" : "active";
    const res = await fetch(`/api/admin/groups/${group.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      setGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, status: nextStatus } : g)));
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/groups/${id}`, { method: "DELETE" });
    if (res.ok) setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <div>
      <Card className="mb-8">
        <CardContent>
          <h2 className="mb-4 text-sm font-semibold">Adicionar grupo</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Nome</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Nicho</Label>
              <Input
                required
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
                placeholder="roupas, achadinhos, tênis..."
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Link de convite</Label>
              <Input
                required
                value={form.invite_link}
                onChange={(e) => setForm({ ...form, invite_link: e.target.value })}
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
            <div>
              <Label>Nº participantes</Label>
              <Input
                type="number"
                value={form.member_count}
                onChange={(e) => setForm({ ...form, member_count: e.target.value })}
              />
            </div>
            <div>
              <Label>Foto (URL, opcional)</Label>
              <Input
                value={form.photo_url}
                onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
              />
            </div>
            {error && <p className="sm:col-span-2 text-sm text-danger">{error}</p>}
            <Button type="submit" variant="accent" disabled={creating} className="sm:col-span-2">
              <Plus size={15} /> {creating ? "Adicionando..." : "Adicionar grupo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {groups.length === 0 ? (
        <p className="text-sm text-muted">Nenhum grupo cadastrado ainda.</p>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">{group.name}</h3>
                    <Badge variant="muted">{group.niche}</Badge>
                    <Badge variant={group.status === "active" ? "success" : "danger"}>
                      {group.status === "active" ? "ativo" : "inativo"}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted">{group.invite_link}</p>
                  {group.last_checked_at && (
                    <p className="text-xs text-muted">
                      última checagem: {new Date(group.last_checked_at).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleStatus(group)}>
                    {group.status === "active" ? "Desativar" : "Ativar"}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(group.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
