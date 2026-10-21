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
import {
  GithubIcon as GithubMark,
  InstagramIcon as InstagramMark,
  PinterestIcon as PinterestMark,
  SpotifyIcon as SpotifyMark,
  TelegramIcon as TelegramMark,
  YoutubeIcon as YoutubeMark,
} from "@/components/social-icons";
import Image from "next/image";
import { useEffect, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";

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

interface SocialLink {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { href: "https://github.com/HexVandal", label: "GitHub", icon: GithubMark, color: "text-zinc-300" },
  { href: "https://instagram.com/yourhotgrandpaaa", label: "Instagram", icon: InstagramMark, color: "text-fuchsia-400" },
  { href: "https://pinterest.com/starlithazel", label: "Pinterest", icon: PinterestMark, color: "text-red-500" },
  { href: "https://open.spotify.com/user/314zc4ljngbdiyhvi46ckaonorai", label: "Spotify", icon: SpotifyMark, color: "text-green-500" },
  { href: "https://t.me/HexVandal", label: "Telegram", icon: TelegramMark, color: "text-sky-400" },
  { href: "https://youtube.com/@starlithazell", label: "YouTube", icon: YoutubeMark, color: "text-red-500" },
  { href: "mailto:callmepriyansh@gmail.com", label: "Email", icon: Mail, color: "text-amber-400" },
];

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
        className="w-[min(30rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border-border/80 bg-background p-0 shadow-2xl"
      >
        <div className="relative h-24 overflow-hidden border-b border-border sm:h-28">
          <Image
            src="/menu-header.png"
            alt="Gloom menu banner"
            fill
            sizes="480px"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <span className="absolute bottom-2.5 left-4 rounded-md bg-black/45 px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-white/80 backdrop-blur-sm">
            THE PERSONAL CORNER
          </span>
        </div>

        <div className="flex h-12 items-center gap-3 border-b border-border bg-muted/20 px-4">
          <span className="text-sm font-bold tracking-wide">GLOOM.</span>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">NAVIGATION</span>
        </div>

        <nav aria-label="Site navigation">
          {MENU_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex min-h-12 items-center gap-3 border-b border-border/80 px-4 text-[15px] font-medium transition-colors hover:bg-secondary/75",
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

        <div className="flex h-12 items-center gap-3 border-b border-border bg-muted/20 px-4">
          <span className="grid size-7 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            <UserRound className="size-4" />
          </span>
          <span className="text-sm font-semibold">Socials</span>
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">ELSEWHERE</span>
        </div>

        <div className="grid grid-cols-3">
          {SOCIAL_LINKS.map(({ href, label, icon: Icon, color }, index) => {
            const isMail = href.startsWith("mailto:");
            const isLastRow = index >= SOCIAL_LINKS.length - (SOCIAL_LINKS.length % 3 || 3);
            const isLastColumn = index % 3 === 2;
            return (
              <a
                key={href}
                href={href}
                {...(isMail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                className={cn(
                  "group flex min-h-12 min-w-0 items-center gap-2 border-r border-border/80 px-3 text-xs transition-colors hover:bg-secondary/70 sm:px-4 sm:text-sm",
                  !isLastRow && "border-b",
                  isLastColumn && "border-r-0",
                )}
              >
                <Icon className={cn("size-[17px] shrink-0 transition-transform group-hover:scale-110", color)} />
                <span className="truncate">{label}</span>
                <ArrowUpRight className="ml-auto size-3.5 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </a>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
