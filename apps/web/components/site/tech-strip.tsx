import { Container, Database, Layers, Server, Triangle, Workflow } from "lucide-react";

const stack = [
  { label: "Next.js 15", icon: Triangle },
  { label: "NestJS 11", icon: Server },
  { label: "PostgreSQL 16", icon: Database },
  { label: "Redis 7", icon: Layers },
  { label: "BullMQ", icon: Workflow },
  { label: "Docker", icon: Container },
] as const;

export function TechStrip() {
  return (
    <section aria-label="Technology stack" className="relative border-y border-white/[0.06] bg-white/[0.012]">
      <div className="shell flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-mist/45">Runs on the boring stack</p>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          {stack.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-mist/70">
              <item.icon className="h-3.5 w-3.5 text-lilac/70" aria-hidden="true" />
              <span className="text-[12px]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
