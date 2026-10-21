"use client";

import { CheckCircle2, Github, GitBranch, Search, Shield } from "lucide-react";

import LogoLoop, { type LogoItem } from "@/components/LogoLoop";

const projectSignals: LogoItem[] = [
  {
    node: <span className="inline-flex items-center gap-2 font-mono text-xs"><Shield className="size-4" /> Security tooling</span>,
    title: "Security tooling",
  },
  {
    node: <span className="inline-flex items-center gap-2 font-mono text-xs"><GitBranch className="size-4" /> Open source</span>,
    title: "Open source",
    href: "https://github.com/HexVandal/nemesis",
  },
  {
    node: <span className="inline-flex items-center gap-2 font-mono text-xs"><Search className="size-4" /> Payload checks</span>,
    title: "Payload checks",
  },
  {
    node: <span className="inline-flex items-center gap-2 font-mono text-xs"><CheckCircle2 className="size-4" /> Evidence-led results</span>,
    title: "Evidence-led results",
  },
  {
    node: <span className="inline-flex items-center gap-2 font-mono text-xs"><Github className="size-4" /> HexVandal / Nemesis</span>,
    title: "Nemesis GitHub repository",
    href: "https://github.com/HexVandal/nemesis",
  },
];

export function ProjectsLogoLoop() {
  return (
    <section className="w-full overflow-hidden rounded-lg border border-border bg-background">
      <header className="flex items-center gap-3 border-b border-border px-5 py-3 text-muted-foreground">
        <GitBranch className="size-4" />
        <h2 className="font-mono text-sm">PROJECT_SIGNALS.md</h2>
        <span className="ml-auto font-mono text-[10px]">NEMESIS</span>
      </header>
      <div className="px-3 py-4">
        <LogoLoop
          logos={projectSignals}
          speed={42}
          hoverSpeed={0}
          logoHeight={30}
          gap={46}
          fadeOut
          fadeOutWidth={0.1}
          scaleOnHover
          layout="wave"
          bend={0.04}
          muted={0.12}
          draggable
          intro
          ariaLabel="Nemesis project details and attributes"
          className="h-12"
        />
      </div>
    </section>
  );
}
