import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { MensagensClient } from "./mensagens-client";

export default async function MensagensDetailPage({
  params,
}: {
  params: Promise<{ affiliateLinkId: string }>;
}) {
  const { affiliateLinkId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: affiliateLink } = await supabase
    .from("affiliate_links")
    .select("id, product_snapshot, affiliate_url, user_id")
    .eq("id", affiliateLinkId)
    .single();

  if (!affiliateLink || affiliateLink.user_id !== user!.id) {
    notFound();
  }

  const { data: existingMessages } = await supabase
    .from("messages")
    .select("id, content, is_edited, created_at")
    .eq("affiliate_link_id", affiliateLinkId)
    .order("created_at", { ascending: false });

  const product = affiliateLink.product_snapshot;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold">Mensagens de divulgação.</h1>
      <p className="mb-6 text-sm text-muted">
        Copy pronta com gatilhos mentais. Edite se quiser, ou peça outras.
      </p>

      <Card className="mb-6">
        <CardContent className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">{product.title}</h2>
            <p className="text-xs text-muted">{formatBRL(product.price)}</p>
          </div>
        </CardContent>
      </Card>

      <MensagensClient
        affiliateLinkId={affiliateLinkId}
        hasAffiliateUrl={!!affiliateLink.affiliate_url}
        initialMessages={existingMessages ?? []}
      />
    </div>
  );
}
