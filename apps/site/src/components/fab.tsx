"use client";

import { ArrowUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { SiteMenuContent } from "@/components/site-menu";

export function FAB() {
  const [open, setOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const trackScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", trackScroll, { passive: true });
    return () => window.removeEventListener("scroll", trackScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Scroll to top"
        className={cn(
          "fixed bottom-20 md:bottom-25 right-5 md:right-10 z-50 flex items-center justify-center rounded-lg border border-border bg-background p-3 text-foreground transition-all hover:bg-secondary hover:text-secondary-foreground",
          scrollY > 10 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          open ? "translate-y-15 -translate-x-15" : "translate-y-0 translate-x-0",
        )}
        onClick={handleScrollToTop}
      >
        <ArrowUp className="size-6" />
        <span className="sr-only">Scroll to top</span>
      </button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            className="fixed bottom-5 md:bottom-10 right-5 md:right-10 z-50 flex items-center justify-center rounded-lg border border-border bg-background p-3 text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            <X className={cn("size-6 transition-transform duration-200", !open && "rotate-45")} />
            <span className="sr-only">Toggle navigation menu</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={10}
          className="w-auto overflow-visible rounded-2xl border-0 bg-transparent p-0 shadow-none"
        >
          <SiteMenuContent onNavigate={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </>
  );
}
