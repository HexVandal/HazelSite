import { Book, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import type { StaticImageData } from "next/image";
import type { WebPage, WithContext } from "schema-dts";

import CuteImage from "@/assets/img/cute.jpg";
import {
  BlogCountBadge,
  BlogTagFilters,
  BlogToolbar,
} from "@/components/blog/blog-toolbar";
import { BlogPagination } from "@/components/blog/blog-pagination";
import { BlogProvider } from "@/components/blog/blog-context";
import { PostList } from "@/components/blog/post-list";
import { PageHero } from "@/components/page-hero";
import Container from "@/components/container";
import { TextScroll } from "@/components/ui/text-scroll";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Write stuff and things.",
  openGraph: {
    title: "Blog",
    description: "Write stuff and things.",
  },
};

const SITE_URL = "https://thesonofnyx.vercel.app";

export default async function BlogPage() {
  const posts = await getAllPosts();

  const jsonLd: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Blog",
    alternateName: "gloom. | Blog",
    mainEntityOfPage: `${SITE_URL}/blog`,
    description: "Write stuff and things.",
    url: `${SITE_URL}/blog`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Landing",
          item: `${SITE_URL}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "About",
          item: `${SITE_URL}/about`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Blog",
          item: `${SITE_URL}/blog`,
        },
      ],
    },
  };

  return (
    <>
      <Container>
        <PageHero
          image={(CuteImage as StaticImageData).src}
          alt="Blog page banner"
          title="ALL POSTS"
        />

        <div className="w-full rounded-lg border border-border bg-background">
          <h2 className="flex w-full items-center gap-3 border-b border-border px-5 py-2.5 text-muted-foreground">
            <Book className="size-4" />
            <span className="font-mono text-sm">DETAILS.md</span>
          </h2>
          <p className="px-5 py-3">
            In case you&apos;re wondering—yeah, I write. Sometimes it&apos;s
            deep, sometimes it&apos;s dumb, sometimes it&apos;s just me trying to
            get the voices in my head to chill. You&apos;ll find rambles, rants,{" "}
            <span className="line-through">a few backshots</span>, unhinged
            thoughts, and whatever else my brain throws at me. Could be random,
            could be genius. Who knows? Not me.
          </p>
        </div>

        <BlogProvider posts={posts}>
          <div
            id="blog-posts-card"
            className="flex w-full scroll-mt-20 flex-col overflow-hidden rounded-lg border border-border bg-background"
          >
            <div className="sticky top-0 z-30 flex w-full flex-col gap-3 border-b border-border bg-background/95 px-4 py-3.5 text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-5">
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex shrink-0 items-center gap-3">
                  <Newspaper className="size-4 shrink-0" />
                  <span className="font-mono text-sm">ALL_POSTS.md</span>
                </div>
                <BlogCountBadge />
              </div>

              <BlogToolbar />
              <BlogTagFilters />
            </div>

            <PostList />
            <BlogPagination />
          </div>
        </BlogProvider>

      </Container>

      <TextScroll
        className="py-24 text-5xl font-bold text-muted-foreground/50 md:space-y-2 md:text-7xl dark:font-semibold"
        textClassName="py-1 md:py-3 font-doto"
        default_velocity={0.66}
        text="AGES AND AGES LATER AND I'M STILL WRITING RANDOM SHIT."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
