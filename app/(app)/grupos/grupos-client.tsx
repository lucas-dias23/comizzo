"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Users } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type GroupRow = Database["public"]["Tables"]["groups"]["Row"];

export function GruposClient({ groups }: { groups: GroupRow[] }) {
  const niches = useMemo(() => Array.from(new Set(groups.map((g) => g.niche))).sort(), [groups]);
  const [activeNiche, setActiveNiche] = useState("todos");

  const filtered = activeNiche === "todos" ? groups : groups.filter((g) => g.niche === activeNiche);

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="text-sm text-muted">
          Nenhum grupo cadastrado ainda. O admin adiciona os grupos verificados no painel.
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Tabs
        items={[{ id: "todos", label: "Todos" }, ...niches.map((n) => ({ id: n, label: n }))]}
        active={activeNiche}
        onChange={setActiveNiche}
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((group) => (
          <Card key={group.id}>
            <CardContent>
              <div className="mb-3 flex items-center gap-3">
                {group.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={group.photo_url}
                    alt={group.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Users size={20} />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium">{group.name}</h3>
                  <Badge variant="muted">{group.niche}</Badge>
                </div>
              </div>

              {group.member_count != null && (
                <p className="mb-3 text-xs text-muted">
                  {group.member_count.toLocaleString("pt-BR")} participantes
                </p>
              )}

              <Button
                variant="accent"
                size="sm"
                className="w-full"
                onClick={() => window.open(group.invite_link, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink size={14} /> Entrar no grupo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
