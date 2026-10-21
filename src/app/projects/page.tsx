import type { Metadata } from "next";
import { GitCommit, FolderKanban } from "lucide-react";

import Container from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { ProjectsGallery } from "@/components/about/projects-gallery";
import { ProjectsLogoLoop } from "@/components/projects-logo-loop";
import { MarkdownIntroCard } from "@/components/markdown-intro-card";
import { ContributionGraph } from "@/components/contributions/contribution-graph";
import { TextScroll } from "@/components/ui/text-scroll";

const GITHUB_USERNAME = "HexVandal";

export const metadata: Metadata = {
  title: "Projects",
  description: "A few things I’ve built, experimented with, and put into the world.",
  openGraph: {
    title: "Projects",
    description: "A few things I’ve built, experimented with, and put into the world.",
  },
};

export default function ProjectsPage() {
  return (
    <>
      <Container>
        <PageHero
          image="/banners/projects-keyboard-cat.jpg"
          alt="A cat resting on a computer keyboard"
          title="PROJECTS"
        />
        <MarkdownIntroCard
          title="ABOUT_PROJECTS.md"
          icon={<FolderKanban className="size-4" />}
          description="A small collection of things I’ve built and explored. Right now, this page highlights Nemesis, an open-source security scanner, with its project details and repository below."
        />

        <ProjectsLogoLoop />
        <ProjectsGallery />

        <section className="w-full rounded-lg border border-border bg-background">
          <h2 className="flex items-center gap-3 border-b border-border px-5 py-3 text-muted-foreground">
            <GitCommit className="size-4" />
            <span className="font-mono text-sm">CONTRIBUTIONS.md</span>
          </h2>
          <div className="w-full p-5">
            <ContributionGraph username={GITHUB_USERNAME} />
          </div>
        </section>
      </Container>
      <TextScroll
        className="py-20 text-5xl font-bold text-muted-foreground/50 md:text-7xl dark:font-semibold"
        textClassName="py-1 font-doto"
        default_velocity={0.55}
        text="SOME THINGS I MADE. SOME THINGS I BROKE."
      />
    </>
  );
}
