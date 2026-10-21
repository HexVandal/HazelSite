"use client";

import Fuse from "fuse.js";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useDebouncedValue } from "@/hooks/use-debounce";
import type { Post } from "@/lib/types/posts";

export type SortOption =
  | "most-recent"
  | "oldest"
  | "alpha-asc"
  | "alpha-desc"
  | "longest-read"
  | "shortest-read";

interface BlogContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  allTags: string[];
  filteredPosts: Post[];
  paginatedPosts: Post[];
  totalPosts: number;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalPages: number;
}

const BlogContext = createContext<BlogContextValue | null>(null);

export function useBlogContext(): BlogContextValue {
  const context = useContext(BlogContext);

  if (!context) {
    throw new Error("useBlogContext must be used inside <BlogProvider>");
  }

  return context;
}

function lastEdited(post: Post): number {
  return Math.max(Date.parse(post.updatedAt) || 0, Date.parse(post.createdAt) || 0);
}

function comparePosts(a: Post, b: Post, sort: SortOption): number {
  switch (sort) {
    case "most-recent":
      return lastEdited(b) - lastEdited(a);
    case "oldest":
      return (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0);
    case "alpha-asc":
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    case "alpha-desc":
      return b.title.localeCompare(a.title, undefined, { sensitivity: "base" });
    case "longest-read":
      return (
        b.readingMinutes - a.readingMinutes || lastEdited(b) - lastEdited(a)
      );
    case "shortest-read":
      return (
        a.readingMinutes - b.readingMinutes || lastEdited(b) - lastEdited(a)
      );
    default:
      return 0;
  }
}

const PAGE_SIZE = 4;

export function BlogProvider({
  posts,
  children,
}: {
  posts: Post[];
  children: ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("most-recent");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedQuery = useDebouncedValue(searchQuery, 250);

  const allTags = useMemo(() => {
    const tags = new Set<string>();

    for (const post of posts) {
      for (const tag of post.tags) {
        if (tag) tags.add(tag);
      }
    }

    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: "title", weight: 0.6 },
          { name: "description", weight: 0.3 },
          { name: "tags", weight: 0.4 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const query = debouncedQuery.trim();
    let pool = query ? fuse.search(query).map((result) => result.item) : posts;

    if (selectedTag) {
      pool = pool.filter((post) => post.tags.includes(selectedTag));
    }

    return [...pool].sort((a, b) => comparePosts(a, b, sortOption));
  }, [debouncedQuery, selectedTag, sortOption, fuse, posts]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedPosts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredPosts.slice(start, start + PAGE_SIZE);
  }, [filteredPosts, safePage]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedTag || sortOption !== "most-recent",
  );

  const update = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
    setSortOption("most-recent");
    setCurrentPage(1);
  };

  return (
    <BlogContext.Provider
      value={{
        searchQuery,
        setSearchQuery: update(setSearchQuery),
        sortOption,
        setSortOption: update(setSortOption),
        selectedTag,
        setSelectedTag: update(setSelectedTag),
        allTags,
        filteredPosts,
        paginatedPosts,
        totalPosts: posts.length,
        resetFilters,
        hasActiveFilters,
        currentPage: safePage,
        setCurrentPage,
        pageSize: PAGE_SIZE,
        totalPages,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}
