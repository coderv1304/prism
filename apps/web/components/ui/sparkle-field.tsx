import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

const sparkles = [
  { top: "12%", left: "6%", size: 14, delay: "0s", opacity: 0.55 },
  { top: "22%", left: "46%", size: 10, delay: "-1.8s", opacity: 0.4 },
  { top: "8%", left: "78%", size: 16, delay: "-3.2s", opacity: 0.5 },
  { top: "58%", left: "92%", size: 11, delay: "-0.7s", opacity: 0.45 },
  { top: "74%", left: "3%", size: 12, delay: "-2.4s", opacity: 0.35 },
  { top: "42%", left: "84%", size: 9, delay: "-4.1s", opacity: 0.3 },
] as const;

export function SparkleField({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {sparkles.map((sparkle, index) => (
        <Sparkles
          key={index}
          className="absolute animate-pulse-soft text-fuchsia"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: sparkle.size,
            height: sparkle.size,
            opacity: sparkle.opacity,
            animationDelay: sparkle.delay,
          }}
        />
      ))}
    </div>
  );
}
