import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16", className)} {...props} />
  );
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton rounded-sm", className)} {...props} />;
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-body text-[11px] font-medium uppercase tracking-[0.35em] text-gold",
        className
      )}
    >
      <span className="h-px w-8 bg-gold/60" aria-hidden />
      {children}
    </p>
  );
}

export function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={cn("h-3.5 w-3.5", i < value ? "fill-gold" : "fill-sand")} aria-hidden>
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.11l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}