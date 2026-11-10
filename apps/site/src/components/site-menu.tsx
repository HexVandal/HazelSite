"use client";

import {
  ArrowUpRight,
  FolderKanban,
  Home,
  Mail,
  Menu,
  Newspaper,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { SiteLink as Link } from "@/components/site-link";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MenuLink {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const MENU_LINKS: MenuLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/about", label: "About", icon: UserRound },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function SiteMenuContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="w-[min(30rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl">
      <div className="relative h-24 overflow-hidden border-b border-border sm:h-28">
        <Image
          src="/menu-header.png"
          alt="Gloom menu banner"
          fill
          sizes="480px"
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <span className="absolute bottom-2.5 left-4 rounded-md bg-black/45 px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-white/80 backdrop-blur-sm">
          THE PERSONAL CORNER
        </span>
      </div>

      <div className="flex h-12 items-center gap-3 border-b border-border bg-muted/20 px-4">
        <span className="text-sm font-bold tracking-wide">GLOOM.</span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          NAVIGATION
        </span>
      </div>

      <nav aria-label="Site navigation">
        {MENU_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname?.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              prefetch
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex min-h-11 items-center gap-3 border-b border-border/80 px-4 text-[15px] font-medium transition-colors hover:bg-secondary/75",
                isActive && "bg-secondary/70",
              )}
            >
              <Icon className="size-[18px] text-muted-foreground transition-colors group-hover:text-foreground" />
              <span>{label}</span>
              {isActive ? (
                <span className="ml-auto size-1.5 rounded-full bg-foreground" />
              ) : (
                <ArrowUpRight className="ml-auto size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-70" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 cursor-pointer"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          <Menu className="size-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-auto overflow-visible rounded-2xl border-0 bg-transparent p-0 shadow-none"
      >
        <SiteMenuContent onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}