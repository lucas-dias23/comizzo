import Anthropic from "@anthropic-ai/sdk";
import type { ProductSnapshot } from "@/types/database";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

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
- Retorne SOMENTE um array JSON de strings, sem markdown, sem texto antes ou depois.`;

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
estratégia/gatilho diferente. Responda só com o array JSON de ${count} strings.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    temperature: 1,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Resposta da IA sem conteúdo de texto.");
  }

  const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Não foi possível interpretar a resposta da IA.");
  }

  const messages = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(messages) || messages.some((m) => typeof m !== "string")) {
    throw new Error("Formato inesperado na resposta da IA.");
  }

  return messages as string[];
}
