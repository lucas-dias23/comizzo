"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "whitespace-nowrap rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            active === item.id
              ? "border-accent text-foreground"
              : "border-transparent text-muted hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
