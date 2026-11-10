"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { copyText } from "@/lib/copy-text";

export function CopyButton({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!(await copyText(code))) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      title={copied ? "Copied!" : "Copy code"}
      className={cn(
        "absolute top-2 right-2 z-10 cursor-pointer rounded-md border border-border/60 bg-background/80 p-1.5 text-muted-foreground opacity-0 backdrop-blur transition-all group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5 text-green-500" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  );
}
