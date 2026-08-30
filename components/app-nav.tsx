"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Link2, MessageSquareText, Users, CreditCard, ShieldCheck, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produtos", label: "Produtos", icon: Link2 },
  { href: "/mensagens", label: "Mensagens", icon: MessageSquareText },
  { href: "/grupos", label: "Grupos", icon: Users },
  { href: "/conta", label: "Conta", icon: CreditCard },
];

export function AppNav({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <Link href="/dashboard">
        <Logo className="mb-8 px-2 text-lg" />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/20 text-foreground border border-primary/40"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Admin
            </div>
            <Link
              href="/admin/grupos"
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-primary/20 text-foreground border border-primary/40"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <ShieldCheck size={17} />
              Painel admin
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-border pt-4">
        <p className="mb-2 truncate px-2 text-xs text-muted">{email}</p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-hover hover:text-foreground"
        >
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </aside>
  );
}
