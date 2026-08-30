import type { MeliCategory, MeliProduct } from "./types";

// Dados de demonstração usados enquanto MELI_CLIENT_ID/MELI_CLIENT_SECRET não
// estão configurados. Cobrem os nichos mais comuns de grupo de revenda no
// WhatsApp, com preço/quantidade vendida variando o bastante pra exercitar o
// algoritmo de score (lib/scoring.ts) de forma realista.
export const MOCK_CATEGORIES: MeliCategory[] = [
  { id: "MLB1430", name: "Roupas e Calçados" },
  { id: "MLB1000", name: "Eletrônicos, Áudio e Vídeo" },
  { id: "MLB1246", name: "Beleza e Cuidado Pessoal" },
  { id: "MLB1574", name: "Casa, Móveis e Decoração" },
  { id: "MLB1132", name: "Brinquedos e Hobbies" },
  { id: "MLB1276", name: "Esportes e Fitness" },
];

const PRODUCT_TEMPLATES: Record<string, { title: string; basePrice: number }[]> = {
  MLB1430: [
    { title: "Tênis Esportivo Casual Unissex", basePrice: 89.9 },
    { title: "Kit 3 Camisetas Básicas Algodão", basePrice: 59.9 },
    { title: "Jaqueta Corta-Vento Impermeável", basePrice: 129.9 },
    { title: "Óculos de Sol Polarizado", basePrice: 39.9 },
    { title: "Relógio Digital Esportivo", basePrice: 74.9 },
  ],
  MLB1000: [
    { title: "Fone de Ouvido Bluetooth TWS", basePrice: 49.9 },
    { title: "Carregador Turbo 20W USB-C", basePrice: 34.9 },
    { title: "Caixa de Som Portátil Bluetooth", basePrice: 99.9 },
    { title: "Smartwatch Tela Amoled", basePrice: 159.9 },
    { title: "Suporte de Celular Veicular", basePrice: 24.9 },
  ],
  MLB1246: [
    { title: "Kit Skincare Facial Completo", basePrice: 69.9 },
    { title: "Chapinha Modeladora Profissional", basePrice: 89.9 },
    { title: "Perfume Contratipo 100ml", basePrice: 54.9 },
    { title: "Secador de Cabelo Íon", basePrice: 119.9 },
    { title: "Máscara Facial de Argila", basePrice: 19.9 },
  ],
  MLB1574: [
    { title: "Luminária de Mesa LED Touch", basePrice: 44.9 },
    { title: "Organizador de Guarda-Roupa 8 Peças", basePrice: 39.9 },
    { title: "Jogo de Panelas Antiaderente", basePrice: 189.9 },
    { title: "Cortina Blackout 2 Metros", basePrice: 64.9 },
    { title: "Aspirador Portátil Automotivo", basePrice: 79.9 },
  ],
  MLB1132: [
    { title: "Pelúcia Gigante Urso 80cm", basePrice: 84.9 },
    { title: "Quebra-Cabeça 1000 Peças", basePrice: 34.9 },
    { title: "Carrinho de Controle Remoto", basePrice: 109.9 },
    { title: "Kit Massinha de Modelar", basePrice: 29.9 },
    { title: "Patinete Infantil Dobrável", basePrice: 199.9 },
  ],
  MLB1276: [
    { title: "Faixa Elástica de Resistência Kit", basePrice: 29.9 },
    { title: "Garrafa Térmica Squeeze 1L", basePrice: 32.9 },
    { title: "Corda de Pular com Contador", basePrice: 24.9 },
    { title: "Luva de Musculação Par", basePrice: 27.9 },
    { title: "Colete de Compressão Esportivo", basePrice: 69.9 },
  ],
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getMockHighlights(categoryId: string): MeliProduct[] {
  const templates = PRODUCT_TEMPLATES[categoryId] ?? [];
  const products: MeliProduct[] = [];

  for (let i = 0; i < 20; i++) {
    const template = templates[i % templates.length];
    const variance = seededRandom(i * 7 + categoryId.length);
    const price = Math.round(template.basePrice * (0.85 + variance * 0.5) * 100) / 100;
    const soldQuantity = Math.round(5000 * (1 - i / 22) * (0.7 + variance * 0.6));

    products.push({
      itemId: `${categoryId}-MOCK-${i + 1}`,
      categoryId,
      title: i < templates.length ? template.title : `${template.title} (variação ${i + 1})`,
      thumbnail: null,
      price,
      permalink: `https://www.mercadolivre.com.br/p/${categoryId}-mock-${i + 1}`,
      soldQuantity: Math.max(soldQuantity, 10),
      rankPosition: i + 1,
    });
  }

  return products;
}
