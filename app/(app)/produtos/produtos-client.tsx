"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Flame, ShoppingBag } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { formatBRL } from "@/lib/utils";
import { scoreProducts, type ScoredProduct } from "@/lib/scoring";
import type { Database, ProductSnapshot } from "@/types/database";

type CategoryRow = Pick<Database["public"]["Tables"]["categories"]["Row"], "id" | "name">;
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const MELI_AFFILIATE_URL = "https://www.mercadolivre.com.br/l/afiliados-home";

export function ProdutosClient({
  categories,
  products,
  commissionMap,
}: {
  categories: CategoryRow[];
  products: ProductRow[];
  commissionMap: Record<string, number>;
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [selected, setSelected] = useState<{ product: ProductRow; score: ScoredProduct } | null>(
    null
  );
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const scoredByCategory = useMemo(() => {
    const byCategory = new Map<string, ProductRow[]>();
    for (const p of products) {
      if (!byCategory.has(p.category_id)) byCategory.set(p.category_id, []);
      byCategory.get(p.category_id)!.push(p);
    }

    const result = new Map<string, { product: ProductRow; score: ScoredProduct }[]>();
    for (const [categoryId, items] of byCategory) {
      const scored = scoreProducts(
        items.map((p) => ({
          itemId: p.item_id,
          price: p.price,
          rankPosition: p.rank_position,
          commissionPct: commissionMap[categoryId] ?? null,
        }))
      );
      const scoreByItemId = new Map(scored.map((s) => [s.itemId, s]));
      result.set(
        categoryId,
        items
          .map((product) => ({ product, score: scoreByItemId.get(product.item_id)! }))
          .sort((a, b) => b.score.score - a.score.score)
      );
    }
    return result;
  }, [products, commissionMap]);

  const activeList = scoredByCategory.get(activeCategory) ?? [];

  function openAffiliateModal(product: ProductRow, score: ScoredProduct) {
    setSelected({ product, score });
    setAffiliateUrl("");
    setModalError(null);
    navigator.clipboard?.writeText(product.permalink).catch(() => {});
    window.open(MELI_AFFILIATE_URL, "_blank", "noopener,noreferrer");
  }

  async function handleSaveAffiliateLink() {
    if (!selected || !affiliateUrl.trim()) return;
    setSaving(true);
    setModalError(null);

    const category = categories.find((c) => c.id === selected.product.category_id);
    const productSnapshot: ProductSnapshot = {
      item_id: selected.product.item_id,
      title: selected.product.title,
      price: selected.product.price,
      permalink: selected.product.permalink,
      thumbnail: selected.product.thumbnail,
      category_id: selected.product.category_id,
      category_name: category?.name,
    };

    const res = await fetch("/api/affiliate-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSnapshot, affiliateUrl: affiliateUrl.trim() }),
    });
    const body = await res.json();

    setSaving(false);
    if (!res.ok) {
      setModalError(body.error ?? "Não foi possível salvar o link.");
      return;
    }

    router.push(`/mensagens/${body.id}`);
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="text-sm text-muted">
          Nenhuma categoria ativa ainda. Configure em{" "}
          <span className="text-foreground">/admin</span> ou aguarde o próximo ciclo de importação.
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Tabs
        items={categories.map((c) => ({ id: c.id, label: c.name }))}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      {activeList.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="text-sm text-muted">
            Ainda sem produtos carregados pra essa categoria. O catálogo é atualizado
            automaticamente algumas vezes por dia.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activeList.map(({ product, score }, index) => (
            <Card key={product.item_id} className="flex flex-col overflow-hidden">
              <div className="flex h-40 items-center justify-center bg-background">
                {product.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ShoppingBag className="text-muted" size={40} />
                )}
              </div>
              <CardContent className="flex flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-medium">{product.title}</h3>
                  {index < 3 && (
                    <Badge variant="accent" className="shrink-0">
                      <Flame size={12} /> top
                    </Badge>
                  )}
                </div>

                <p className="text-lg font-semibold">{formatBRL(product.price)}</p>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="primary">#{product.rank_position} mais vendido</Badge>
                  {commissionMap[product.category_id] != null && (
                    <Badge variant="muted">{commissionMap[product.category_id]}% comissão</Badge>
                  )}
                  <Badge variant="muted">score {score.score.toFixed(0)}</Badge>
                </div>

                <div className="mt-auto flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(product.permalink, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink size={14} /> Ver anúncio
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    className="flex-1"
                    onClick={() => openAffiliateModal(product, score)}
                  >
                    Me afiliar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Cola o link de afiliado"
      >
        <p className="mb-4 text-sm text-muted">
          Copiamos o link do produto e abrimos a página de afiliados do Mercado Livre em outra
          aba. Gere o link lá (Gerador de link ou Barra de Afiliados) e cola ele aqui embaixo.
        </p>
        <Label htmlFor="affiliateUrl">Link de afiliado</Label>
        <Input
          id="affiliateUrl"
          value={affiliateUrl}
          onChange={(e) => setAffiliateUrl(e.target.value)}
          placeholder="https://mercadolivre.com/sec/..."
        />
        {modalError && <p className="mt-2 text-sm text-danger">{modalError}</p>}
        <Button
          variant="accent"
          className="mt-4 w-full"
          onClick={handleSaveAffiliateLink}
          disabled={saving || !affiliateUrl.trim()}
        >
          {saving ? "Salvando..." : "Salvar e criar mensagem"}
        </Button>
      </Modal>
    </div>
  );
}
