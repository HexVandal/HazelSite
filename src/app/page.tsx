import Container from "@/components/container";
import { Metadata } from "next";
import { Hero } from "@/components/hero";
import type { WebPage, WithContext } from "schema-dts";

import HeroImage from "@/assets/img/hero.jpg";
import HeroProfile from "@/assets/img/profpic-animated.webp";
import { Book, Pickaxe } from "lucide-react";
import { TextScroll } from "@/components/ui/text-scroll";

export const metadata: Metadata = {
  title: "Landing | gloom.",
  description: "Where it all begins.",
  openGraph: {
    title: "Landing | gloom.",
    description: "Where it all begins.",
  },
};

export default function Home() {
  const jsonLd: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Landing / gloom.",
    alternateName: "gloom.",
    mainEntityOfPage: "https://thesonofnyx.vercel.app/",
    description: "Where it all begins.",
    url: "https://thesonofnyx.vercel.app/",
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
        <Hero img={HeroImage} profile={HeroProfile} />
        <div className="w-full bg-background rounded-lg border border-border">
          <h2 className="w-full flex items-center gap-3 text-muted-foreground px-5 py-3 border-b border-border">
            <Book className="size-4" />
            <span className="text-sm font-mono">DESCRIPTION.md</span>
          </h2>
          <p className="px-5 py-3">
            Hi, I’m clever, creative, confidently independent, and endlessly curious. I think differently, question everything, and move with purpose. I might come off a little cold at first—don’t take it personally, it’s just the ice. But once the vibe clicks, I’m helpful, witty, and occasionally flirt with genius (and sarcasm).
            <br /><br />
            I’m not shy—I just speak when it matters. A bit arrogant? Maybe. Judgmental? Only when it’s earned. Complex? Always. I’m the type to read the room, raise an eyebrow, and keep it real. Sometimes suspicious, sometimes blunt—but never boring.
          </p>
        </div>
        <div className="w-full bg-background rounded-lg border border-border">
          <h2 className="w-full flex items-center gap-3 text-muted-foreground px-5 py-3 border-b border-border">
            <Pickaxe className="size-4" />
            <span className="text-sm font-mono">MORE.md</span>
          </h2>
          <p className="px-5 py-3">
            Got questions? Ask away—I don’t bite... unless you’re annoying.
          <br />
          <br />
            Wanna chat? I’m all ears (and just the right dose of chaos).
          <br />
          <br />
          I like good conversations, weird questions, and midnight thoughts that go off the rails. Just don’t hit me with dry small talk—I ghost that.
          </p>
        </div>
        <div className="w-full bg-background rounded-lg border border-border">
        </div>
      </Container>
      <TextScroll
        className="text-5xl md:text-7xl text-muted-foreground/50 dark:font-semibold font-bold py-24 md:space-y-2"
        textClassName="py-1 md:py-3 font-doto"
        default_velocity={0.66}
        text="BLAH BLAH BLAH BLUU BLUU."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}