import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col gap-5", align === "center" ? "items-center text-center" : "items-start", className)}
    >
      {eyebrow ? <span className="label text-rust">{eyebrow}</span> : null}
      <h2 className="max-w-3xl text-[clamp(1.9rem,4.2vw,3.2rem)] leading-[1.02] text-current">{title}</h2>
      {description ? (
        <p className={cn("max-w-2xl text-[14px] leading-7 opacity-65", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
