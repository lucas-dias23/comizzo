import Link from "next/link";
import { Link2, MessageSquareText, Users, TrendingUp } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    icon: TrendingUp,
    title: "Encontre.",
    body: "Os produtos que mais vendem no Mercado Livre, priorizados por comissão, ticket e ranking.",
  },
  {
    icon: Link2,
    title: "Afilie-se.",
    body: "Copiamos o link, abrimos a página de afiliados do ML e você cola o link de volta. Rápido.",
  },
  {
    icon: MessageSquareText,
    title: "Divulgue.",
    body: "Mensagens com copy e gatilhos mentais geradas por IA, prontas pra colar no grupo.",
  },
  {
    icon: Users,
    title: "Venda.",
    body: "Escolha o grupo certo pro nicho do produto e entre direto pela plataforma.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Logo className="text-lg" />
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted hover:text-foreground">
            Entrar
          </Link>
          <Link href="/signup">
            <Button variant="accent" size="sm">
              Assinar
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-12">
        <section className="mx-auto flex max-w-3xl flex-col items-center py-20 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Encontre. Afilie-se. <span className="text-accent">Divulgue.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Comizzo acha os produtos do Mercado Livre que mais valem a pena afiliar, escreve a
            mensagem de venda pra você e te leva direto ao grupo certo. Sem enrolação.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/signup">
              <Button variant="accent" size="lg">
                Quero vender
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardContent>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Icon size={20} />
                </div>
                <h3 className="mb-1 font-semibold">{title}</h3>
                <p className="text-sm text-muted">{body}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted md:px-12">
        Comizzo © {new Date().getFullYear()} — não afiliado ao Mercado Livre.
      </footer>
    </div>
  );
}
