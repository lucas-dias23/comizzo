import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMessages } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const { affiliateLinkId } = (await request.json()) as { affiliateLinkId: string };
  if (!affiliateLinkId) {
    return NextResponse.json({ error: "affiliateLinkId obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  const { data: affiliateLink, error: fetchError } = await supabase
    .from("affiliate_links")
    .select("id, product_snapshot, affiliate_url, user_id")
    .eq("id", affiliateLinkId)
    .single();

  if (fetchError || !affiliateLink || affiliateLink.user_id !== user.id) {
    return NextResponse.json({ error: "link de afiliado não encontrado" }, { status: 404 });
  }
  if (!affiliateLink.affiliate_url) {
    return NextResponse.json({ error: "esse produto ainda não tem link de afiliado" }, { status: 400 });
  }

  try {
    const variants = await generateMessages(
      affiliateLink.product_snapshot,
      affiliateLink.affiliate_url
    );

    const { data: inserted, error: insertError } = await supabase
      .from("messages")
      .insert(
        variants.map((content) => ({
          user_id: user.id,
          affiliate_link_id: affiliateLinkId,
          content,
        }))
      )
      .select("id, content, is_edited, created_at");

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ messages: inserted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro ao gerar mensagens";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
