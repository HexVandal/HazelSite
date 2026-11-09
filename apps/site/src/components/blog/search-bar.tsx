"use client";

import { Search, X } from "lucide-react";

import { useBlogContext } from "@/components/blog/blog-context";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useBlogContext();

  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Search posts..."
        aria-label="Search posts"
        className="h-9 border-border/50 bg-secondary/40 pr-8 pl-9 text-xs transition-colors focus-visible:border-ring focus-visible:bg-background [&::-webkit-search-cancel-button]:hidden"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          title="Clear search"
          aria-label="Clear search"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
