"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useBlogContext } from "@/components/blog/blog-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageItem = number | "ellipsis";

function getPageNumbers(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: PageItem[] = [1];

  if (currentPage > 3) pages.push("ellipsis");

  for (
    let page = Math.max(2, currentPage - 1);
    page <= Math.min(totalPages - 1, currentPage + 1);
    page++
  ) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) pages.push("ellipsis");

  pages.push(totalPages);

  return pages;
}

export function BlogPagination() {
  const { currentPage, setCurrentPage, pageSize, totalPages, filteredPosts } =
    useBlogContext();

  if (filteredPosts.length === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredPosts.length);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);
    document
      .getElementById("blog-posts-card")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Blog post pagination"
      className="flex w-full flex-col items-center justify-between gap-2.5 border-t border-border bg-secondary/10 px-3.5 py-2.5 sm:flex-row sm:gap-4 sm:px-5"
    >
      <p className="order-2 text-center font-mono text-[0.65rem] text-muted-foreground sm:order-1 sm:text-left sm:text-xs">
        Showing <span className="font-medium text-foreground">{startItem}</span>
        –<span className="font-medium text-foreground">{endItem}</span> of{" "}
        <span className="font-medium text-foreground">
          {filteredPosts.length}
        </span>{" "}
        {filteredPosts.length === 1 ? "post" : "posts"}
      </p>

      {totalPages > 1 && (
        <div className="order-1 flex items-center gap-1 sm:order-2 sm:gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="h-8 border-border bg-background/80 px-2 font-mono text-xs transition-colors hover:bg-secondary/60 disabled:opacity-40 sm:px-2.5"
          >
            <ChevronLeft className="size-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers(currentPage, totalPages).map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1 font-mono text-xs text-muted-foreground select-none"
                  >
                    …
                  </span>
                );
              }

              const isSelected = page === currentPage;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  aria-current={isSelected ? "page" : undefined}
                  className={cn(
                    "flex h-8 min-w-8 cursor-pointer items-center justify-center rounded border px-2 font-mono text-xs transition-all",
                    isSelected
                      ? "border-primary bg-primary font-semibold text-primary-foreground shadow-xs"
                      : "border-border bg-background/80 text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="h-8 border-border bg-background/80 px-2 font-mono text-xs transition-colors hover:bg-secondary/60 disabled:opacity-40 sm:px-2.5"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </nav>
  );
}
