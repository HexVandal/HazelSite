import type { Metadata } from "next";
import { Mail } from "lucide-react";

import Container from "@/components/container";
import { PageHero } from "@/components/page-hero";
import { ContactCard } from "@/components/about/contact-card";
import { MarkdownIntroCard } from "@/components/markdown-intro-card";
import { TextScroll } from "@/components/ui/text-scroll";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Hazel, or request a résumé.",
  openGraph: {
    title: "Contact",
    description: "Get in touch with Hazel, or request a résumé.",
  },
};

export default function ContactPage() {
  return (
    <>
      <Container>
        <PageHero
          image="/banners/contact-collage.jpg"
          alt="A dark collage with a night view of Paris, a spider emblem, and a music player"
          title="CONTACT"
        />
        <MarkdownIntroCard
          title="ABOUT_CONTACT.md"
          icon={<Mail className="size-4" />}
          description="Have a question, an idea, or want to get in touch? Use the email below. You can also request a résumé directly; that option will open a pre-filled email."
        />
        <ContactCard />
      </Container>
      <TextScroll
        className="py-20 text-5xl font-bold text-muted-foreground/50 md:text-7xl dark:font-semibold"
        textClassName="py-1 font-doto"
        default_velocity={0.55}
        text="SAY HELLO. I DON'T BITE. PROBABLY."
      />
    </>
  );
}
