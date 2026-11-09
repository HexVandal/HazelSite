"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, PencilLine } from "lucide-react";
import { Link } from "next-view-transitions";

import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/types/posts";

export function PostCard({ post }: { post: Post }) {
  const { slug, title, description, createdAt, updatedAt, tags, readingTime } =
    post;

  const edited = updatedAt && updatedAt !== createdAt;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Link
        href={`/blog/${slug}`}
        className="group flex w-full flex-col overflow-clip rounded-md border border-border bg-secondary/20 transition-colors hover:border-foreground/25 hover:bg-secondary/40"
      >
        <div className="flex w-full flex-col gap-1 px-4 pt-3 sm:px-5">
          <h3 className="w-full text-base leading-snug font-semibold sm:text-lg">
            {title}
          </h3>
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono text-[0.68rem] text-muted-foreground sm:text-xs">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3" />
              {formatDate(createdAt)}
            </span>
            {edited && (
              <span className="flex items-center gap-1">
                <PencilLine className="size-3" />
                {formatDate(updatedAt)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              Est. {readingTime}
            </span>
          </p>
        </div>

        {description && (
          <p className="line-clamp-2 w-full overflow-hidden px-4 py-2.5 text-xs text-muted-foreground/90 sm:px-5 sm:py-3 sm:text-sm">
            {description}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex w-full flex-wrap gap-1.5 px-4 pb-3 text-[0.65rem] text-muted-foreground sm:px-5 sm:gap-2 sm:text-xs">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary px-2.5 py-0.5 text-[0.65rem] font-medium text-primary-foreground sm:text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
