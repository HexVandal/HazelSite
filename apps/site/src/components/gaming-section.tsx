"use client";

import Image from "next/image";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import ReflectiveCard from "@/components/ReflectiveCard";
import { copyText } from "@/lib/copy-text";

const games = [
  {
    name: "Genshin Impact",
    image: "/games/genshin-impact.jpg",
    account: "Milk Man",
  },
  {
    name: "Wuthering Waves",
    image: "/games/wuwa.jpg",
    account: "Onyx",
  },
  {
    name: "Zenless Zone Zero",
    image: "/games/zenless-zone-zero.jpg",
    account: "Onyx",
  },
] as const;

function CopyAccount({ gameName, value }: { gameName: string; value: string }) {
  const [status, setStatus] = useState<"copied" | "failed" | "">("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copyAccount = async () => {
    if (timer.current) clearTimeout(timer.current);
    setStatus(await copyText(value) ? "copied" : "failed");
    timer.current = setTimeout(() => setStatus(""), 1800);
  };

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-white/20 bg-black/40 px-2.5 py-2 backdrop-blur-md">
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[9px] uppercase tracking-wider text-white/55">
          Account
        </span>
        <span className="block truncate font-mono text-xs font-medium text-white">
          {value}
        </span>
      </span>
      <button
        type="button"
        onClick={copyAccount}
        aria-label={`Copy ${gameName} account name`}
        title="Copy account name"
        className="grid size-8 shrink-0 place-items-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        {status === "copied" ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
      <span aria-live="polite" className="sr-only">
        {status === "copied" ? "Copied" : status === "failed" ? "Could not copy" : ""}
      </span>
    </div>
  );
}

export function GamingSection() {
  return (
    <section className="w-full overflow-hidden rounded-xl border border-border bg-background">
      <header className="flex items-center gap-3 border-b border-border px-5 py-3 text-muted-foreground">
        <span aria-hidden="true" className="font-mono">✦</span>
        <h2 className="font-mono text-sm">ABOUT_GAMES.md</h2>
        <span className="ml-auto font-mono text-[10px]">TILT TO EXPLORE</span>
      </header>
      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <ReflectiveCard
            key={game.name}
            width="100%"
            height={355}
            radius={14}
            theme="dark"
            webcam={false}
            tint="#d8d0e5"
            metalness={0.72}
            roughness={0.42}
            blurStrength={7}
            grayscale={0.72}
            warp={0.28}
            shine={0.72}
            glare={0.32}
            enableTilt
            tiltStrength={7}
            intro
            className="w-full"
          >
            <div className="relative h-full w-full">
              <div className="absolute -inset-[var(--rc-pad)] z-0 overflow-hidden">
                <Image
                  src={game.image}
                  alt={`${game.name} artwork`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/5" />
              </div>
              <div className="relative z-10 flex h-full flex-col justify-end gap-3">
                <h3 className="font-doto text-xl font-bold leading-tight text-white drop-shadow-lg">
                  {game.name}
                </h3>
                <CopyAccount gameName={game.name} value={game.account} />
              </div>
            </div>
          </ReflectiveCard>
        ))}
      </div>
    </section>
  );
}
