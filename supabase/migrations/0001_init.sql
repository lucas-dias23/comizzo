-- Comizzo — schema inicial
-- Rodar via Supabase CLI (supabase db push) ou colar no SQL editor do projeto.

-- ============ profiles ============
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  is_admin boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'inactive'
    check (subscription_status in ('inactive', 'active', 'past_due', 'canceled')),
  subscription_plan text check (subscription_plan in ('monthly', 'yearly')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: user reads own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: user updates own (não financeiro)" on public.profiles
  for update using (auth.uid() = id);

-- cria o profile automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============ categories ============
create table if not exists public.categories (
  id text primary key, -- ex: MLB1051
  name text not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories: leitura autenticada" on public.categories
  for select using (auth.role() = 'authenticated');

-- ============ category_commissions ============
-- % de comissão publicada pelo ML por categoria — não vem da API pública,
-- mantida manualmente pelo admin.
create table if not exists public.category_commissions (
  category_id text primary key references public.categories (id) on delete cascade,
  commission_pct numeric(5, 2) not null check (commission_pct >= 0 and commission_pct <= 100),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

alter table public.category_commissions enable row level security;

create policy "category_commissions: leitura autenticada" on public.category_commissions
  for select using (auth.role() = 'authenticated');

-- ============ products ============
-- snapshot cacheado do highlights por categoria (refresh via cron)
create table if not exists public.products (
  item_id text not null,
  category_id text not null references public.categories (id) on delete cascade,
  title text not null,
  thumbnail text,
  price numeric(12, 2) not null,
  permalink text not null,
  sold_quantity integer default 0,
  rank_position integer not null,
  refreshed_at timestamptz not null default now(),
  primary key (item_id, category_id)
);

create index if not exists products_category_idx on public.products (category_id);

alter table public.products enable row level security;

create policy "products: leitura autenticada" on public.products
  for select using (auth.role() = 'authenticated');

-- ============ groups ============
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  niche text not null,
  invite_link text not null,
  member_count integer,
  photo_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  last_checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists groups_niche_idx on public.groups (niche);

alter table public.groups enable row level security;

create policy "groups: leitura de grupos ativos" on public.groups
  for select using (auth.role() = 'authenticated' and status = 'active');

-- ============ affiliate_links ============
create table if not exists public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id text not null,
  product_snapshot jsonb not null,
  affiliate_url text,
  created_at timestamptz not null default now()
);

create index if not exists affiliate_links_user_idx on public.affiliate_links (user_id);

alter table public.affiliate_links enable row level security;

create policy "affiliate_links: dono lê/escreve" on public.affiliate_links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ messages ============
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  affiliate_link_id uuid not null references public.affiliate_links (id) on delete cascade,
  content text not null,
  is_edited boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_affiliate_link_idx on public.messages (affiliate_link_id);

alter table public.messages enable row level security;

create policy "messages: dono lê/escreve" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ writes administrativas ============
-- admin (is_admin=true) pode escrever em categories/category_commissions/groups.
-- as rotas /api/admin/* usam o service role key (bypassa RLS) após checar
-- profiles.is_admin no servidor, então não há policy de "insert/update" pública
-- aqui — mantém a superfície de ataque menor.
