import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = ["/dashboard", "/produtos", "/mensagens", "/grupos", "/conta", "/admin"];
const ADMIN_PREFIXES = ["/admin"];
// /conta is where an inactive subscriber lands to pay — it must stay reachable
// without an active subscription, or the redirect below would loop forever.
const REQUIRES_ACTIVE_SUBSCRIPTION = ["/dashboard", "/produtos", "/mensagens", "/grupos", "/admin"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Supabase ainda não configurado (.env.local) — deixa passar sem checar
    // sessão pra dar pra ver a landing page/branding antes de plugar o backend.
    // Toda rota protegida segue bloqueada abaixo assim que as env vars existirem.
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isAdminRoute = ADMIN_PREFIXES.some((p) => path.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, is_admin")
      .eq("id", user.id)
      .single();

    if (isAdminRoute && !profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    const needsActiveSubscription = REQUIRES_ACTIVE_SUBSCRIPTION.some((p) => path.startsWith(p));

    if (!isAdminRoute && needsActiveSubscription && profile?.subscription_status !== "active") {
      const url = request.nextUrl.clone();
      url.pathname = "/conta";
      url.searchParams.set("assinatura", "pendente");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
