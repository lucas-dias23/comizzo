import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-foreground hover:bg-primary-hover border border-primary",
  accent:
    "bg-accent text-[#1a1206] font-semibold hover:bg-accent-hover shadow-[0_0_0_1px_rgba(245,158,11,0.4)]",
  ghost: "bg-transparent text-foreground hover:bg-surface-hover",
  outline: "bg-transparent border border-border text-foreground hover:bg-surface-hover",
  danger: "bg-danger text-white hover:bg-red-600",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-md",
  md: "text-sm px-4 py-2.5 rounded-lg",
  lg: "text-base px-6 py-3 rounded-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
