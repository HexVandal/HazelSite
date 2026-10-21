"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { SITE_SETTINGS } from "@/lib/site-settings";

/** Apply the private scroll preferences globally; no visible settings UI. */
export function SmoothScroll() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("gloom-custom-scrollbar", SITE_SETTINGS.customScrollbar);

    if (!SITE_SETTINGS.smoothScrolling || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => root.classList.remove("gloom-custom-scrollbar");
    }

    const lenis = new Lenis({
      lerp: SITE_SETTINGS.scrollVelocity,
      duration: SITE_SETTINGS.scrollDuration,
      smoothWheel: true,
      syncTouch: false,
    });

    let frame = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
      root.classList.remove("gloom-custom-scrollbar");
    };
  }, []);

  return null;
}
