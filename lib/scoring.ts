// Score de prioridade dos produtos minerados.
//
// Três camadas, da mais pra menos importante (nessa ordem de peso):
//   1. Comissão            — peso alto,  decide a maior parte do score.
//   2. Faixa de preço      — peso médio, favorece ticket de compra por impulso.
//   3. Posição no ranking  — peso baixo, só serve pra desempatar produtos
//                             que já ficaram próximos nos dois critérios acima.
export const SCORE_WEIGHTS = {
  commission: 0.65,
  priceBand: 0.3,
  rank: 0.05,
} as const;

// Faixa "ideal" de ticket pra compra por impulso em grupo de WhatsApp.
// Fora dessa curva o produto ainda pontua, só que cada vez menos.
const PRICE_BAND_CURVE: { max: number; score: number }[] = [
  { max: 20, score: 55 },
  { max: 150, score: 100 },
  { max: 300, score: 65 },
  { max: 600, score: 30 },
  { max: Infinity, score: 10 },
];

export interface ScorableProduct {
  itemId: string;
  price: number;
  rankPosition: number; // 1..20 (1 = mais vendido)
  commissionPct: number | null; // null = categoria sem comissão cadastrada ainda
}

export interface ScoredProduct extends ScorableProduct {
  score: number;
  commissionScore: number;
  priceBandScore: number;
  rankScore: number;
}

function priceBandScore(price: number): number {
  const band = PRICE_BAND_CURVE.find((b) => price <= b.max);
  return band?.score ?? 0;
}

/**
 * Calcula o score de cada produto do conjunto. A comissão é normalizada
 * contra a maior comissão do próprio conjunto (não um valor absoluto fixo),
 * então o ranking se ajusta automaticamente ao universo de categorias
 * exibidas em cada aba.
 */
export function scoreProducts(products: ScorableProduct[]): ScoredProduct[] {
  const maxCommission = Math.max(1, ...products.map((p) => p.commissionPct ?? 0));
  const maxRankPosition = Math.max(1, ...products.map((p) => p.rankPosition));

  return products
    .map((p) => {
      const commissionScore = ((p.commissionPct ?? 0) / maxCommission) * 100;
      const priceScore = priceBandScore(p.price);
      const rankScore = ((maxRankPosition - p.rankPosition + 1) / maxRankPosition) * 100;

      const score =
        commissionScore * SCORE_WEIGHTS.commission +
        priceScore * SCORE_WEIGHTS.priceBand +
        rankScore * SCORE_WEIGHTS.rank;

      return {
        ...p,
        score: Math.round(score * 100) / 100,
        commissionScore: Math.round(commissionScore),
        priceBandScore: Math.round(priceScore),
        rankScore: Math.round(rankScore),
      };
    })
    .sort((a, b) => b.score - a.score);
}
