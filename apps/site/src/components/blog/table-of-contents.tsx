"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ headings = [] }: { headings?: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: [0, 1] },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-lg border border-border bg-background/80 p-4 backdrop-blur"
    >
      <p className="mb-3 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
        On this page
      </p>
      <ul className="flex flex-col gap-0.5 border-l border-border">
        {headings.map((heading) => {
          const isActive = heading.id === activeId;

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  "-ml-px block border-l py-1 text-xs leading-snug transition-colors",
                  heading.level === 3 ? "pl-6" : "pl-3",
                  isActive
                    ? "border-foreground font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
