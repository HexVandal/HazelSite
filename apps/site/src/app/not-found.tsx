import { ArrowLeft, Home, NotebookText } from "lucide-react";
import { Link } from "next-view-transitions";

import { Button } from "@/components/ui/button";
import FuzzyText from "@/components/FuzzyText";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-3xl items-center justify-center px-5 py-12">
      <section className="w-full overflow-hidden rounded-xl border border-border bg-background">
        <header className="flex items-center gap-3 border-b border-border bg-muted/20 px-5 py-3 text-muted-foreground">
          <span className="font-mono text-sm">404.md</span>
          <span className="ml-auto font-mono text-[10px]">PAGE NOT FOUND</span>
        </header>
        <div className="flex flex-col items-center px-6 py-12 text-center sm:px-12">
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
            WRONG TURN, RIGHT WEBSITE
          </p>
          <h1 className="mt-3 flex h-28 w-full justify-center sm:h-36">
            <FuzzyText
              fontSize="clamp(4.5rem, 18vw, 8rem)"
              fontWeight={800}
              fontFamily="var(--font-doto)"
              color="currentColor"
              baseIntensity={0.1}
              hoverIntensity={0.32}
              fuzzRange={18}
              direction="horizontal"
              transitionDuration={12}
              trigger="hover"
              intro
              introDuration={900}
              glitchMode={false}
              className="h-full w-64 text-foreground sm:w-80"
            >
              404
            </FuzzyText>
          </h1>
          <p className="mt-3 max-w-md text-balance text-muted-foreground">
            This page wandered off into the void. It happens. The homepage and the blog are still right here.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="size-4" /> Back home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/blog" className="flex items-center gap-2">
                <NotebookText className="size-4" /> Read the blog
              </Link>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="mt-5 text-muted-foreground" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="size-3.5" /> Take me somewhere less haunted
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
