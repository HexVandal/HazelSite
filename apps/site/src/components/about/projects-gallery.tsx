import Image from "next/image";
import { ArrowUpRight, Code2 } from "lucide-react";

import { ABOUT_PROJECTS } from "@/lib/about-content";

export function ProjectsGallery() {
  return (
    <section className="w-full overflow-hidden rounded-lg border border-border bg-background">
      <header className="flex items-center gap-3 border-b border-border px-5 py-3 text-muted-foreground">
        <Code2 className="size-4" />
        <h2 className="font-mono text-sm">PROJECTS.md</h2>
        <span className="ml-auto font-mono text-[10px]">OPEN SOURCE</span>
      </header>
      <div className="p-4">
        {ABOUT_PROJECTS.map((project) => (
          <article
            key={project.name}
            className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-secondary/20"
          >
            <div className="relative aspect-[16/8] overflow-hidden border-b border-border bg-muted">
              <Image
                src={project.image}
                alt={project.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, 720px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-5">
              <p className="font-mono text-[10px] tracking-wider text-muted-foreground">
                {project.eyebrow}
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">
                {project.name}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 border-t border-border pt-3">
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs transition-colors hover:bg-secondary"
                >
                  View repository <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
