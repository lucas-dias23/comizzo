import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <div className="flex min-h-screen">
      <AppNav email={user?.email ?? ""} isAdmin={isAdmin} />
      <main className="flex-1 bg-background px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
