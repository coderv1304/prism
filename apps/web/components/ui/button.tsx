import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-violet";

const variants: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(100deg,#8b5cf6_0%,#c026d3_55%,#d946ef_100%)] text-white shadow-[0_12px_44px_-16px_rgba(168,85,247,0.95),inset_0_1px_0_rgba(255,255,255,0.28)] hover:brightness-110 hover:shadow-[0_18px_60px_-18px_rgba(217,70,239,0.9)] active:scale-[0.985]",
  secondary:
    "border border-white/10 bg-white/[0.045] text-white backdrop-blur-md hover:border-white/20 hover:bg-white/[0.085] active:scale-[0.985]",
  outline:
    "border border-white/15 bg-transparent text-white hover:border-violet/50 hover:bg-violet/10 active:scale-[0.985]",
  ghost: "text-mist hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

interface ButtonStyleProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonStyleProps & Omit<ComponentProps<typeof Link>, "href" | "className" | "children"> & { href: string }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: ButtonStyleProps & ComponentProps<"button">) {
  return (
    <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
