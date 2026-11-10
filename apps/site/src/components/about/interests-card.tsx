"use client";

import {
  BookOpen,
  Compass,
  CookingPot,
  Headphones,
  Palette,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import CardSwap, { Card } from "@/components/CardSwap";
import { ABOUT_INTERESTS } from "@/lib/about-content";

const icons = [BookOpen, Palette, CookingPot, Compass, Sparkles, Headphones];

export function InterestsCard() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(420);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateWidth = () => {
      setCardWidth(Math.max(220, Math.min(460, Math.floor(stage.clientWidth - 32))));
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full overflow-hidden rounded-lg border border-border bg-background">
      <header className="flex items-center gap-3 border-b border-border px-5 py-3 text-muted-foreground">
        <Compass className="size-4" />
        <h2 className="font-mono text-sm">INTERESTS.md</h2>
        <span className="ml-auto font-mono text-[10px]">DRAG TO BROWSE</span>
      </header>
      <div ref={stageRef} className="h-[350px] w-full overflow-hidden px-2 py-3 sm:h-[390px] sm:px-5">
        <CardSwap
          width={cardWidth}
          height={272}
          cardDistance={20}
          verticalDistance={40}
          depth={64}
          skewAmount={4}
          visibleCards={3}
          delay={6000}
          autoplay
          pauseOnHover
          draggable
          speed={0.9}
          bounce={0.22}
          parallax={0.28}
          hoverSpread={0.08}
          dim={0.4}
          cardRadius={12}
          intro
          theme="dark"
          className="h-full w-full"
        >
          {ABOUT_INTERESTS.map((interest, index) => {
            const Icon = icons[index] ?? Sparkles;
            return (
              <Card key={interest.label} className="border border-white/10">
                <div className="flex h-full flex-col p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-white/10 text-white/80">
                      <Icon className="size-4" />
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.18em] text-white/50">
                      INTEREST {(index + 1).toString().padStart(2, "0")} / {ABOUT_INTERESTS.length.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 font-doto text-lg font-bold leading-tight text-white sm:text-xl">
                    {interest.label}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-white/75 sm:text-sm">
                    {interest.emphasis ? (
                      <>
                        {interest.prefix}
                        <strong className="font-semibold text-white">
                          {interest.emphasis}
                        </strong>
                        {interest.suffix}
                      </>
                    ) : (
                      interest.detail
                    )}
                  </p>
                </div>
              </Card>
            );
          })}
        </CardSwap>
      </div>
    </section>
  );
}
