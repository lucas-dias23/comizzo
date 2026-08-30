import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/utils";

export default async function MensagensPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: affiliateLinks } = await supabase
    .from("affiliate_links")
    .select("id, product_snapshot, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Mensagens.</h1>
      <p className="mb-6 text-sm text-muted">
        Divulgue. Escolha um produto que você já se afiliou pra gerar a copy de venda.
      </p>

      {!affiliateLinks || affiliateLinks.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted">
            Você ainda não se afiliou a nenhum produto. Vá em{" "}
            <Link href="/produtos" className="text-accent hover:text-accent-hover">
              Produtos
            </Link>{" "}
            e clique em &ldquo;Me afiliar&rdquo; em algum item.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {affiliateLinks.map((link) => {
            const product = link.product_snapshot;
            return (
              <Link key={link.id} href={`/mensagens/${link.id}`}>
                <Card className="h-full transition-colors hover:bg-surface-hover">
                  <CardContent>
                    <h3 className="mb-2 line-clamp-2 text-sm font-medium">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{formatBRL(product.price)}</span>
                      <Badge variant="muted">{product.category_name ?? "produto"}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
