import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 whitespace-nowrap border font-medium rounded-[2px] transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust";

const variants: Record<Variant, string> = {
  primary: "border-rust bg-rust text-paper hover:border-ink hover:bg-ink",
  secondary: "border-ink/30 bg-transparent text-current hover:border-ink hover:bg-ink hover:text-paper",
  outline: "border-current/30 bg-transparent text-current hover:border-rust hover:text-rust",
  ghost: "border-transparent bg-transparent text-current underline decoration-current/30 underline-offset-4 hover:decoration-current",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-[12px]",
  md: "h-10 px-4 text-[13px]",
  lg: "h-11 px-5 text-[13.5px]",
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
