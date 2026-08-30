import OpenAI from "openai";
import type { ProductSnapshot } from "@/types/database";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

// Instanciado sob demanda (não no escopo do módulo) — o construtor da SDK
// lança erro se OPENAI_API_KEY não estiver setada, e esse arquivo é
// carregado durante o build do Next.js pra coletar metadados da rota, antes
// das env vars de produção existirem.
function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `Você escreve mensagens de venda pra grupos de WhatsApp em nome da Comizzo.
Tom de marca: direto, sem enrolação, com uma pitada de malandragem boa — linguagem de quem
quer resultado rápido, não de manual corporativo. Frases curtas, verbos de ação.

Regras:
- Português do Brasil, coloquial mas sem gírias regionais forçadas.
- Cada mensagem precisa caber numa mensagem de WhatsApp (curta, escaneável, quebras de linha
  curtas, no máximo 1-2 emojis por mensagem, sem exagero).
- Use pelo menos um gatilho mental por mensagem (escassez, prova social, urgência, curiosidade
  ou autoridade) — varie entre as mensagens, não repita o mesmo gatilho nas três.
- Sempre termine a mensagem com o link de afiliado em uma linha própria.
- Nunca invente informação sobre o produto que não foi passada (preço, nome).
- Não prometa nada que soe golpe ("ganhe dinheiro fácil", "milagre"), mantenha credibilidade.
- Responda em JSON: um objeto com a chave "messages" contendo um array de strings.`;

export async function generateMessages(
  product: ProductSnapshot,
  affiliateUrl: string,
  count = 3
): Promise<string[]> {
  const userPrompt = `Produto: ${product.title}
Preço: R$ ${product.price.toFixed(2)}
Categoria: ${product.category_name ?? "não informado"}
Link de afiliado (usar exatamente esse): ${affiliateUrl}

Gere ${count} variações de mensagem de divulgação pra grupo de WhatsApp, cada uma usando uma
estratégia/gatilho diferente. Responda só com o JSON pedido, com exatamente ${count} mensagens.`;

  const response = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Resposta da IA sem conteúdo.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Não foi possível interpretar a resposta da IA.");
  }

  const messages =
    parsed && typeof parsed === "object" && "messages" in parsed
      ? (parsed as { messages: unknown }).messages
      : parsed;

  if (!Array.isArray(messages) || messages.some((m) => typeof m !== "string")) {
    throw new Error("Formato inesperado na resposta da IA.");
  }

  return messages as string[];
}
