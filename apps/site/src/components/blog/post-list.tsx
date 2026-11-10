"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SearchX } from "lucide-react";

import { useBlogContext } from "@/components/blog/blog-context";
import { PostCard } from "@/components/blog/post-card";

export function PostList() {
  const { paginatedPosts, hasActiveFilters } = useBlogContext();

  return (
    <div className="flex w-full flex-col gap-3.5 p-3.5 sm:gap-5 sm:p-5">
      <AnimatePresence mode="popLayout" initial={false}>
        {paginatedPosts.length > 0 ? (
          paginatedPosts.map((post) => <PostCard key={post.slug} post={post} />)
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-40 w-full flex-col items-center justify-center gap-2 text-muted-foreground"
          >
            <SearchX className="size-8 opacity-20" />
            <p className="text-sm">
              {hasActiveFilters
                ? "No posts match those filters."
                : "No posts yet. Check back soon."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
