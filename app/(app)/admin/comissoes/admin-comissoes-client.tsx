"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CategoryWithCommission {
  id: string;
  name: string;
  active: boolean;
  commission_pct: number | null;
}

export function AdminComissoesClient({
  initialCategories,
}: {
  initialCategories: CategoryWithCommission[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialCategories.map((c) => [c.id, c.commission_pct?.toString() ?? ""]))
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  async function saveCommission(categoryId: string) {
    const value = Number(drafts[categoryId]);
    if (Number.isNaN(value) || value < 0 || value > 100) return;

    setSavingId(categoryId);
    const res = await fetch("/api/admin/commissions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, commissionPct: value }),
    });
    setSavingId(null);
    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, commission_pct: value } : c))
      );
    }
  }

  async function toggleActive(category: CategoryWithCommission) {
    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !category.active }),
    });
    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, active: !c.active } : c))
      );
    }
  }

  if (categories.length === 0) {
    return <p className="text-sm text-muted">Nenhuma categoria importada ainda.</p>;
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">{category.name}</h3>
                <Badge variant={category.active ? "success" : "danger"}>
                  {category.active ? "aba ativa" : "aba oculta"}
                </Badge>
              </div>
              <p className="text-xs text-muted">{category.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={drafts[category.id] ?? ""}
                  onChange={(e) => setDrafts({ ...drafts, [category.id]: e.target.value })}
                  className="w-20"
                />
                <span className="text-sm text-muted">%</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveCommission(category.id)}
                disabled={savingId === category.id}
              >
                {savingId === category.id ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toggleActive(category)}>
                {category.active ? "Ocultar" : "Ativar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
