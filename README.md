# Comizzo 🔗

Encontre. Afilie-se. Divulgue. SaaS que ajuda a minerar os melhores produtos do
Mercado Livre pra afiliação, gerar mensagens de venda com IA, e escolher onde
divulgar em grupos de WhatsApp.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Postgres + Auth)
- AbacatePay (assinatura mensal/anual via PIX)
- OpenAI (GPT) pra gerar as mensagens
- API do Mercado Livre (com fallback pra dados mock enquanto não há credenciais)
- Deploy: Vercel (+ Vercel Cron pra atualizar o catálogo de produtos)

## Setup local

```bash
npm install
cp .env.local.example .env.local   # preencha as variáveis, ver abaixo
npm run dev
```

Sem preencher `MELI_CLIENT_ID`/`MELI_CLIENT_SECRET`, a área de Produtos funciona
com dados de demonstração (`lib/meli/mock.ts`) — dá pra testar o fluxo completo
(score, "Me afiliar", mensagens, grupos) sem depender do Mercado Livre.

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings > API**, copie `Project URL`, `anon public key` e
   `service_role key` pro `.env.local`.
3. Em **Authentication > Providers > Email**, desative a confirmação por
   e-mail obrigatória (**Confirm email**) — o fluxo de cadastro leva direto
   pro pagamento, então o usuário precisa já ter sessão ativa nesse momento.
4. Rode os SQLs na ordem no SQL Editor do projeto (ou via `supabase db push`):
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_abacatepay.sql`
5. Pra virar admin (acessa `/admin/*`), rode no SQL Editor:
   ```sql
   update public.profiles set is_admin = true where email = 'voce@email.com';
   ```

### 2. AbacatePay

1. Crie uma conta em [app.abacatepay.com](https://app.abacatepay.com).
2. Em **Configurações > API**, copie a chave da API pra `ABACATEPAY_API_KEY`.
3. Crie os dois produtos de assinatura (mensal e anual) no painel e copie o
   **ID de cada produto** (`prod_...`, não o preço) pras variáveis
   `ABACATEPAY_PRODUCT_MONTHLY` e `ABACATEPAY_PRODUCT_YEARLY`.
4. Escolha um segredo (qualquer string aleatória) e configure a URL do
   webhook como `https://SEU_DOMINIO/api/webhooks/abacatepay?webhookSecret=SEU_SEGREDO`,
   escutando: `subscription.completed`, `subscription.renewed`,
   `subscription.cancelled`. Cole o mesmo segredo em
   `ABACATEPAY_WEBHOOK_SECRET`.
   > A verificação de assinatura HMAC do AbacatePay (header
   > `x-webhook-signature`) ainda não está implementada — confirme com a
   > documentação deles antes de habilitar, e enquanto isso trate esse
   > endpoint como confiando só no `webhookSecret` acima.
5. Em desenvolvimento local, use ngrok ou similar pra expor `localhost:3000`
   e configure a URL temporária no painel do AbacatePay.
6. **Cancelamento**: hoje `/api/billing-portal` só marca a assinatura como
   cancelada no banco do Comizzo — ele não chama a API do AbacatePay pra
   cancelar a cobrança recorrente de verdade. Cancele também pelo painel do
   AbacatePay (ou pelo canal de suporte deles) até isso ser automatizado.

### 3. OpenAI

Gere uma API key em [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
e coloque em `OPENAI_API_KEY`. O modelo usado é configurável via `OPENAI_MODEL`
(padrão `gpt-4o-mini`) — ajuste pro modelo que preferir na sua conta.

### 4. Mercado Livre (opcional na v1)

Quando tiver uma aplicação registrada em
[developers.mercadolivre.com.br](https://developers.mercadolivre.com.br),
preencha `MELI_CLIENT_ID` e `MELI_CLIENT_SECRET`. A integração usa
`client_credentials` (dados públicos do catálogo, sem autorizar usuário) e cai
automaticamente pro modo mock se as credenciais não estiverem configuradas.

### 5. Cron de atualização do catálogo

`vercel.json` já define um cron batendo em `/api/cron/refresh-products`
duas vezes por dia. Configure `CRON_SECRET` no projeto da Vercel — o Vercel
Cron envia esse valor automaticamente como `Authorization: Bearer`.

## Painel admin

- `/admin/grupos` — adicionar/editar/desativar grupos de WhatsApp após a
  checagem manual semanal.
- `/admin/comissoes` — cadastrar a % de comissão por categoria (não vem da
  API do ML) e decidir quais categorias aparecem como aba em Produtos.

## Fora de escopo na v1

Envio automático/em massa de mensagens no WhatsApp, geração de link `wa.me`
pré-preenchido, cadastro de grupo pelo próprio usuário, verificação
automática de link de grupo, planos com features diferentes (só
mensal/anual, mesmo acesso).
