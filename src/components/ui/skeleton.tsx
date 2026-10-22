import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg border border-border/50 bg-muted motion-reduce:animate-none", className)} {...props} />;
}

export function SkeletonStatus({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return <div className={className} role="status" aria-label={label} aria-busy="true">
    <span className="sr-only">{label}</span>
    <div aria-hidden="true">{children}</div>
  </div>;
}
