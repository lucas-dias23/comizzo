# Comizzo 🔗

Encontre. Afilie-se. Divulgue. SaaS que ajuda a minerar os melhores produtos do
Mercado Livre pra afiliação, gerar mensagens de venda com IA, e escolher onde
divulgar em grupos de WhatsApp.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Postgres + Auth)
- Stripe (assinatura mensal/anual)
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
   pro pagamento no Stripe, então o usuário precisa já ter sessão ativa
   nesse momento.
4. Rode o SQL de `supabase/migrations/0001_init.sql` no SQL Editor do
   projeto (ou via `supabase db push` se usar a CLI).
5. Pra virar admin (acessa `/admin/*`), rode no SQL Editor:
   ```sql
   update public.profiles set is_admin = true where email = 'voce@email.com';
   ```

### 2. Stripe

1. Crie um produto "Comizzo" com dois preços recorrentes: mensal e anual.
2. Copie os IDs dos preços (`price_...`) pro `.env.local`
   (`STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY`).
3. Copie a chave secreta (`sk_...`) pra `STRIPE_SECRET_KEY`.
4. Configure um webhook apontando pra
   `https://SEU_DOMINIO/api/webhooks/stripe`, escutando pelo menos:
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copie o signing secret (`whsec_...`)
   pra `STRIPE_WEBHOOK_SECRET`.
5. Em desenvolvimento local, use `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

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
