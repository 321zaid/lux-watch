import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "gold" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  solid: "bg-ink text-ivory hover:bg-graphite",
  gold: "bg-gold text-ivory hover:bg-gold-dark",
  outline: "border border-ink/25 text-ink hover:border-gold hover:text-gold-dark",
  ghost: "text-ink/70 hover:text-ink",
  light: "bg-ivory text-ink hover:bg-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-[11px] tracking-[0.18em]",
  md: "px-7 py-3.5 text-[11px] tracking-[0.22em]",
  lg: "px-10 py-4 text-xs tracking-[0.26em]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "solid", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-none font-body font-medium uppercase transition-colors duration-300 select-none disabled:pointer-events-none disabled:opacity-40",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});