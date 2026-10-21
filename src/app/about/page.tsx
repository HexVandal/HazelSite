import Container from "@/components/container";
import { TextScroll } from "@/components/ui/text-scroll";
import { GamingSection } from "@/components/gaming-section";
import { Book } from "lucide-react";
import { Metadata } from "next";
import type { StaticImageData } from "next/image";
import AwooImage from "@/assets/img/awoo.jpg";
import { InterestsCard } from "@/components/about/interests-card";
import { PageHero } from "@/components/page-hero";
import type { WebPage, WithContext } from "schema-dts";


export const metadata: Metadata = {
  title: "About",
  description: "Young & Dumb!",
  openGraph: {
    title: "About",
    description: "Young & Dumb!",
  },
};

export default function About() {
  const jsonLd: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "About",
    alternateName: "gloom. | About",
    mainEntityOfPage: "https://thesonofnyx.vercel.app/about",
    description: "Young & Dumb!",
    url: "https://thesonofnyx.vercel.app/about",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Landing",
          item: "https://thesonofnyx.vercel.app/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "About",
          item: "https://thesonofnyx.vercel.app/about",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Blog",
          item: "https://thesonofnyx.vercel.app/blog",
        },
      ],
    },
  };


  return (
    <>
      <Container>
        <PageHero
          image={(AwooImage as StaticImageData).src}
          alt="About page banner"
          title="ABOUT ME AND STUFFS"
        />
        <div className="w-full bg-background rounded-lg border border-border">
          <h2 className="w-full flex items-center gap-3 text-muted-foreground px-5 py-3 border-b border-border">
            <Book className="size-4" />
            <span className="text-sm font-mono">SHITPOST.md</span>
          </h2>
          <p className="px-5 py-3">
            I’m what you’d call an unapologetic jack of all trades—if something catches my eye or I randomly decide I need it, I’ll learn it. Fast learner? Sure. Slow as hell when it comes to actually doing it? Also yes. Brain cells are on life support but they’re pushing through. Give ’em some credit.
          <br />
          <br />
            Bad design makes me physically uncomfortable. I like things that <i>look</i> good, not just function. Retro slaps, modern calms my brain—somewhere between VHS and minimalism is my aesthetic therapy.
          <br />
          <br />
            Food? Not picky. Spice? Yes please. Burn my soul, thanks.
          <br />
          <br />
            Shows, movies, all that blah blah? Yeah, I watch ’em—when I’m not busy overthinking life or deep-diving into some random obsession.
          </p>
        </div>
        <InterestsCard />
        <GamingSection />
      </Container>
      <TextScroll
        className="text-5xl md:text-7xl text-muted-foreground/50 dark:font-semibold font-bold py-24 md:space-y-2"
        textClassName="py-1 md:py-3 font-doto"
        default_velocity={0.66}
        text="THIS IS THE END OF THE PAGE, CUH.  "
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
