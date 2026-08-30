import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ProductSnapshot } from "@/types/database";

export async function POST(request: NextRequest) {
  const { productSnapshot, affiliateUrl } = (await request.json()) as {
    productSnapshot: ProductSnapshot;
    affiliateUrl: string;
  };

  if (!productSnapshot?.item_id || !affiliateUrl) {
    return NextResponse.json({ error: "dados incompletos" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("affiliate_links")
    .insert({
      user_id: user.id,
      item_id: productSnapshot.item_id,
      product_snapshot: productSnapshot,
      affiliate_url: affiliateUrl,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
