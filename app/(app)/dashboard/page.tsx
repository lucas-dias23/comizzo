import Link from "next/link";
import { Link2, MessageSquareText, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: affiliateCount }, { count: messageCount }] = await Promise.all([
    supabase.from("affiliate_links").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">
        E aí, bora vender?
      </h1>
      <p className="mb-8 text-sm text-muted">Seu funil de afiliação, do produto ao grupo.</p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent>
            <p className="text-xs text-muted">Produtos afiliados</p>
            <p className="text-3xl font-semibold">{affiliateCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted">Mensagens geradas</p>
            <p className="text-3xl font-semibold">{messageCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <Link2 className="mb-3 text-primary" size={22} />
            <h3 className="mb-1 font-semibold">1. Encontre.</h3>
            <p className="mb-4 text-sm text-muted">
              Minere os produtos com melhor score na categoria que você curte.
            </p>
            <Link href="/produtos">
              <Button variant="outline" size="sm" className="w-full">
                Minerar produtos
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <MessageSquareText className="mb-3 text-primary" size={22} />
            <h3 className="mb-1 font-semibold">2. Divulgue.</h3>
            <p className="mb-4 text-sm text-muted">Gere a copy de venda pros produtos que você afiliou.</p>
            <Link href="/mensagens">
              <Button variant="outline" size="sm" className="w-full">
                Ver mensagens
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Users className="mb-3 text-primary" size={22} />
            <h3 className="mb-1 font-semibold">3. Venda.</h3>
            <p className="mb-4 text-sm text-muted">Escolha o grupo certo pro nicho do produto.</p>
            <Link href="/grupos">
              <Button variant="outline" size="sm" className="w-full">
                Ver grupos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
