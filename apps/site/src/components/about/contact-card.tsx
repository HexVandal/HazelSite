import { ArrowUpRight, Mail } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { CONTACT_EMAIL } from "@/lib/about-content";
import StarBorder from "@/components/StarBorder";

export function ContactCard() {
  const contactHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Hello from your website")}`;
  const resumeHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Resume request")}&body=${encodeURIComponent("Hi Hazel, could you send me your resume?\n\nThanks!")}`;

  return (
    <section className="w-full overflow-hidden rounded-lg border border-border bg-background">
      <header className="flex items-center gap-3 border-b border-border px-5 py-3 text-muted-foreground">
        <Mail className="size-4" />
        <h2 className="font-mono text-sm">CONTACT.md</h2>
      </header>
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Got something to say?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions, ideas, or a project worth staying up late for — my inbox is open.
          </p>
          <a
            href={contactHref}
            className="mt-3 inline-flex items-center gap-2 font-mono text-sm underline decoration-border underline-offset-4 transition-colors hover:text-muted-foreground"
          >
            {CONTACT_EMAIL} <ArrowUpRight className="size-3.5" />
          </a>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <ContactForm triggerLabel="Say hello" />
          <StarBorder
            as="a"
            href={resumeHref}
            color="#c5a8ef"
            trailColor="#6e5596"
            duration={3.4}
            stars={1}
            radius={8}
            thickness={1}
            glow={0.28}
            sparkle
            hover="lap"
            clickPulse
            backgroundColor="var(--background)"
            textColor="var(--foreground)"
            borderColor="var(--border)"
            className="!rounded-md !px-3 !py-2 text-xs font-medium"
          >
            <Mail className="size-3.5" /> Request resume
          </StarBorder>
        </div>
      </div>
    </section>
  );
}
