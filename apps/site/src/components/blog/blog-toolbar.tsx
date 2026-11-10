"use client";

import {
  ArrowDownAZ,
  ArrowUpZA,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Hourglass,
  RotateCcw,
  Tag,
  Zap,
} from "lucide-react";
import { useState, type ComponentType, type WheelEvent } from "react";

import type { SortOption } from "@/components/blog/blog-context";
import { useBlogContext } from "@/components/blog/blog-context";
import { SearchBar } from "@/components/blog/search-bar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SortConfig {
  value: SortOption;
  label: string;
  shortLabel: string;
  icon: ComponentType<{ className?: string }>;
}

const SORT_OPTIONS: SortConfig[] = [
  {
    value: "most-recent",
    label: "Most Recent",
    shortLabel: "Recent",
    icon: Clock,
  },
  {
    value: "oldest",
    label: "Oldest First",
    shortLabel: "Oldest",
    icon: Hourglass,
  },
  {
    value: "alpha-asc",
    label: "Alphabetical (A → Z)",
    shortLabel: "A → Z",
    icon: ArrowDownAZ,
  },
  {
    value: "alpha-desc",
    label: "Alphabetical (Z → A)",
    shortLabel: "Z → A",
    icon: ArrowUpZA,
  },
  {
    value: "longest-read",
    label: "Longest Read",
    shortLabel: "Longest",
    icon: BookOpen,
  },
  {
    value: "shortest-read",
    label: "Shortest Read",
    shortLabel: "Shortest",
    icon: Zap,
  },
];

export function BlogCountBadge() {
  const { filteredPosts, totalPosts, hasActiveFilters, resetFilters } =
    useBlogContext();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="shrink-0 rounded-full border border-border/50 bg-secondary px-2 py-0.5 font-mono text-[0.65rem] text-secondary-foreground">
        {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
        {hasActiveFilters && filteredPosts.length !== totalPosts && (
          <span className="ml-1 text-muted-foreground">of {totalPosts}</span>
        )}
      </span>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          title="Reset all filters and sorting"
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <RotateCcw className="size-3 shrink-0" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}

export function BlogSortMenu() {
  const { sortOption, setSortOption } = useBlogContext();
  const [open, setOpen] = useState(false);

  const current =
    SORT_OPTIONS.find((option) => option.value === sortOption) ??
    SORT_OPTIONS[0];
  const ActiveIcon = current.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 shrink-0 gap-1.5 border-border bg-secondary/30 px-2.5 font-mono text-xs transition-colors hover:bg-secondary/60 sm:gap-2 sm:px-3"
          aria-label={`Sort posts: ${current.label}`}
        >
          <ActiveIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="hidden max-w-36 truncate sm:inline md:max-w-none">
            {current.label}
          </span>
          <span className="inline sm:hidden">{current.shortLabel}</span>
          <ChevronDown className="ml-0.5 size-3.5 shrink-0 opacity-50 sm:ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-56 border-border bg-popover p-1 shadow-lg"
      >
        <p className="px-2 py-1.5 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
          Sort Articles
        </p>
        <div className="my-1 h-px bg-border" />
        {SORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === sortOption;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSortOption(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-sm px-2.5 py-2 text-left text-xs transition-colors",
                isSelected
                  ? "bg-accent font-medium text-accent-foreground"
                  : "hover:bg-accent/60",
              )}
            >
              <span className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "size-3.5",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {option.label}
              </span>
              {isSelected && <Check className="size-3.5 text-primary" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

export function BlogToolbar() {
  return (
    <div className="flex w-full items-center gap-2.5">
      <SearchBar />
      <BlogSortMenu />
    </div>
  );
}

export function BlogTagFilters() {
  const { allTags, selectedTag, setSelectedTag } = useBlogContext();

  if (allTags.length === 0) return null;

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    if (event.deltaY !== 0 && container.scrollWidth > container.clientWidth) {
      container.scrollLeft += event.deltaY;
    }
  };

  return (
    <div className="relative w-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent"
      />
      <div
      onWheel={handleWheel}
      className="no-scrollbar flex w-full items-center gap-1.5 overflow-x-auto scroll-smooth py-1 text-xs"
    >
      <div className="mr-1 flex shrink-0 items-center gap-1 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
        <Tag className="size-3 shrink-0" />
        <span>Tags:</span>
      </div>

      <button
        type="button"
        onClick={() => setSelectedTag(null)}
        className={cn(
          "shrink-0 cursor-pointer rounded-full border px-2 py-0.5 font-mono text-xs transition-all sm:px-2.5",
          selectedTag === null
            ? "border-foreground bg-foreground font-semibold text-background"
            : "border-transparent bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
      >
        All
      </button>

      {allTags.map((tag) => {
        const isSelected = selectedTag === tag;

        return (
          <button
            key={tag}
            type="button"
            onClick={() => setSelectedTag(isSelected ? null : tag)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full border px-2 py-0.5 font-mono text-xs transition-all sm:px-2.5",
              isSelected
                ? "border-primary bg-primary font-semibold text-primary-foreground shadow-xs"
                : "border-transparent bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {tag}
          </button>
        );
      })}
      </div>
    </div>
  );
}
