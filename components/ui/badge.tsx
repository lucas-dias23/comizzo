import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "muted" | "success" | "danger";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary/20 text-violet-300 border border-primary/40",
  accent: "bg-accent/15 text-accent border border-accent/40",
  muted: "bg-surface-hover text-muted border border-border",
  success: "bg-success/15 text-green-400 border border-success/40",
  danger: "bg-danger/15 text-red-400 border border-danger/40",
};

export function Badge({
  className,
  variant = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
