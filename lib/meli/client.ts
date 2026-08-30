import { MOCK_CATEGORIES, getMockHighlights } from "./mock";
import type { MeliCategory, MeliProduct } from "./types";

const SITE_ID = "MLB";
const API_BASE = "https://api.mercadolibre.com";

export function isMockMode() {
  return !process.env.MELI_CLIENT_ID || !process.env.MELI_CLIENT_SECRET;
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

// Access token de aplicação (client_credentials) — usado só pra ler dados
// públicos do catálogo (categorias/highlights/itens), não representa um
// usuário do Mercado Livre.
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.MELI_CLIENT_ID!,
      client_secret: process.env.MELI_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao autenticar na API do Mercado Livre: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.accessToken;
}

export async function getCategories(): Promise<MeliCategory[]> {
  if (isMockMode()) return MOCK_CATEGORIES;

  const res = await fetch(`${API_BASE}/sites/${SITE_ID}/categories`, {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) throw new Error(`Falha ao buscar categorias do ML: ${res.status}`);

  const data: { id: string; name: string }[] = await res.json();
  return data.map((c) => ({ id: c.id, name: c.name }));
}

interface HighlightEntry {
  id: string;
  position: number;
}

interface ItemDetail {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  permalink: string;
  sold_quantity?: number;
}

export async function getCategoryHighlights(categoryId: string): Promise<MeliProduct[]> {
  if (isMockMode()) return getMockHighlights(categoryId);

  const token = await getAccessToken();
  const highlightsRes = await fetch(
    `${API_BASE}/highlights/${SITE_ID}/category/${categoryId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!highlightsRes.ok) {
    throw new Error(`Falha ao buscar highlights de ${categoryId}: ${highlightsRes.status}`);
  }

  const highlights: { content: HighlightEntry[] } = await highlightsRes.json();
  const entries = highlights.content.slice(0, 20);
  if (entries.length === 0) return [];

  // multiget de detalhes dos itens em lotes de 20 (limite da API)
  const ids = entries.map((e) => e.id).join(",");
  const itemsRes = await fetch(`${API_BASE}/items?ids=${ids}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!itemsRes.ok) {
    throw new Error(`Falha ao buscar detalhes dos itens: ${itemsRes.status}`);
  }

  const itemsData: { code: number; body: ItemDetail }[] = await itemsRes.json();
  const byId = new Map(itemsData.filter((i) => i.code === 200).map((i) => [i.body.id, i.body]));

  return entries
    .map((entry): MeliProduct | null => {
      const item = byId.get(entry.id);
      if (!item) return null;
      return {
        itemId: item.id,
        categoryId,
        title: item.title,
        thumbnail: item.thumbnail ?? null,
        price: item.price,
        permalink: item.permalink,
        soldQuantity: item.sold_quantity ?? 0,
        rankPosition: entry.position,
      };
    })
    .filter((p): p is MeliProduct => p !== null);
}
