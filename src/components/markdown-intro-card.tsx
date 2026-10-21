import type { ReactNode } from "react";

interface MarkdownIntroCardProps {
  title: string;
  icon: ReactNode;
  description: string;
}

export function MarkdownIntroCard({ title, icon, description }: MarkdownIntroCardProps) {
  return (
    <section className="w-full overflow-hidden rounded-lg border border-border bg-background">
      <h1 className="flex items-center gap-3 border-b border-border px-5 py-3 text-muted-foreground">
        {icon}
        <span className="font-mono text-sm">{title}</span>
      </h1>
      <p className="px-5 py-3 leading-relaxed">{description}</p>
    </section>
  );
}
