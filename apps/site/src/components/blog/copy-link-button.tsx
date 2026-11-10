"use client";

import { Check, Copy, Link2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/copy-text";

export function CopyLinkButton() {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [state]);

  const copyLink = async () => {
    setState(await copyText(window.location.href) ? "copied" : "error");
  };

  const label = state === "copied" ? "Copied link" : state === "error" ? "Copy unavailable here" : "Copy link";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={copyLink}
      aria-live="polite"
      className="h-8 gap-1.5 font-mono text-[11px]"
    >
      {state === "copied" ? <Check className="size-3.5" /> : state === "idle" ? <Link2 className="size-3.5" /> : <Copy className="size-3.5" />}
      {label}
    </Button>
  );
}
