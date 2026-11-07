import type { Metadata } from "next";
import { ConsoleShell } from "@/components/console/console-shell";

export const metadata: Metadata = {
  title: "Job console",
  description:
    "Submit a background job and watch it move from queued to completed. Redis queueing, BullMQ processing and PostgreSQL persistence in real time.",
  alternates: { canonical: "/console" },
};

export default function ConsolePage() {
  return <ConsoleShell />;
}
