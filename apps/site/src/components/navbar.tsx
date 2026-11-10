"use client";

import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { SiteLink as Link } from "@/components/site-link";

import ThemeToggleButton from "@/components/ui/theme-toggle-button";

export interface FlatNavLinkProps {
  href: string;
  children: React.ReactNode;
}

export interface FlatNavLinkData {
  href: string;
  text: string;
}

export function FlatNavLink({ href, children }: FlatNavLinkProps) {
  return (
    <Link href={href} className="text-primary/75 transition-colors hover:text-primary">
      {children}
    </Link>
  );
}

function prettifySegment(segment: string): string {
  return decodeURIComponent(segment)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function Navbar() {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-full items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <Link
            href="/"
            prefetch
            className="shrink-0 text-xl font-bold text-primary transition-opacity hover:opacity-90 dark:font-medium"
          >
            gloom.
          </Link>

          {segments.length > 0 && (
            <ol aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground sm:flex">
              {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join("/")}`;
                const isLast = index === segments.length - 1;
                return (
                  <Fragment key={href}>
                    <li aria-hidden="true" className="shrink-0">
                      <ChevronRight className="size-3 text-muted-foreground/40" />
                    </li>
                    <li className="min-w-0 shrink">
                      {isLast ? (
                        <span aria-current="page" className="block max-w-32 truncate text-foreground md:max-w-64">
                          {prettifySegment(segment)}
                        </span>
                      ) : (
                        <Link
                          href={href}
                          prefetch
                          className="block max-w-32 truncate transition-colors hover:text-foreground md:max-w-64"
                        >
                          {prettifySegment(segment)}
                        </Link>
                      )}
                    </li>
                  </Fragment>
                );
              })}
            </ol>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center">
          <ThemeToggleButton />
        </div>
      </nav>
    </header>
  );
}
