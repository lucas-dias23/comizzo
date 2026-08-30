import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span aria-hidden>🔗</span>
      <span>
        Comizzo<span className="text-accent">.</span>
      </span>
    </span>
  );
}
