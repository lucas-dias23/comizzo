import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-8">
        <Logo className="text-2xl" />
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8">
        {children}
      </div>
    </div>
  );
}
