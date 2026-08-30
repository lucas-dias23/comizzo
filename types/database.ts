// Tipos manuais espelhando supabase/migrations/0001_init.sql.
// Quando o projeto Supabase existir de verdade, substitua por:
//   npx supabase gen types typescript --project-id <id> > types/database.ts
//
// Importante: os tipos de linha (Row/Insert/Update) precisam ser `type`
// (object literal), não `interface` — o supabase-js checa
// `Row extends Record<string, unknown>` em tempo de tipo pra inferir o
// schema, e interfaces nomeadas não satisfazem esse check estrutural
// (viram `never`), mesmo tendo exatamente as mesmas propriedades.

export type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";
export type SubscriptionPlan = "monthly" | "yearly";
export type GroupStatus = "active" | "inactive";

export type ProductSnapshot = {
  item_id: string;
  title: string;
  price: number;
  permalink: string;
  thumbnail?: string | null;
  category_id: string;
  category_name?: string;
};

export type ProfileRow = {
  id: string;
  email: string;
  is_admin: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlan | null;
  current_period_end: string | null;
  created_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  active: boolean;
  updated_at: string;
};

export type CategoryCommissionRow = {
  category_id: string;
  commission_pct: number;
  updated_at: string;
  updated_by: string | null;
};

export type ProductRow = {
  item_id: string;
  category_id: string;
  title: string;
  thumbnail: string | null;
  price: number;
  permalink: string;
  sold_quantity: number;
  rank_position: number;
  refreshed_at: string;
};

export type GroupRow = {
  id: string;
  name: string;
  niche: string;
  invite_link: string;
  member_count: number | null;
  photo_url: string | null;
  status: GroupStatus;
  last_checked_at: string | null;
  notes: string | null;
  created_at: string;
};

export type AffiliateLinkRow = {
  id: string;
  user_id: string;
  item_id: string;
  product_snapshot: ProductSnapshot;
  affiliate_url: string | null;
  created_at: string;
};

export type MessageRow = {
  id: string;
  user_id: string;
  affiliate_link_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id" | "email">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: Partial<CategoryRow> & Pick<CategoryRow, "id" | "name">;
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      category_commissions: {
        Row: CategoryCommissionRow;
        Insert: Partial<CategoryCommissionRow> &
          Pick<CategoryCommissionRow, "category_id" | "commission_pct">;
        Update: Partial<CategoryCommissionRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: Partial<ProductRow> &
          Pick<ProductRow, "item_id" | "category_id" | "title" | "price" | "permalink" | "rank_position">;
        Update: Partial<ProductRow>;
        Relationships: [];
      };
      groups: {
        Row: GroupRow;
        Insert: Partial<GroupRow> & Pick<GroupRow, "name" | "niche" | "invite_link">;
        Update: Partial<GroupRow>;
        Relationships: [];
      };
      affiliate_links: {
        Row: AffiliateLinkRow;
        Insert: Partial<AffiliateLinkRow> &
          Pick<AffiliateLinkRow, "user_id" | "item_id" | "product_snapshot">;
        Update: Partial<AffiliateLinkRow>;
        Relationships: [];
      };
      messages: {
        Row: MessageRow;
        Insert: Partial<MessageRow> & Pick<MessageRow, "user_id" | "affiliate_link_id" | "content">;
        Update: Partial<MessageRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
