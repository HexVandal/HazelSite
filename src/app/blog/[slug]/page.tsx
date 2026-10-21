import "katex/dist/katex.min.css";

import { ArrowLeft, ArrowRight, Clock, PencilLine } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import type { BlogPosting, WithContext } from "schema-dts";

import {
  extractHeadings,
  renderMarkdown,
} from "@/components/blog/markdown";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { CopyLinkButton } from "@/components/blog/copy-link-button";
import { Button } from "@/components/ui/button";
import { TextScroll } from "@/components/ui/text-scroll";
import { formatDate } from "@/lib/format";
import { getAllPosts, getPostBySlug, getPostSlugs } from "@/lib/posts";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: "article",
      publishedTime: post.frontmatter.createdAt,
      modifiedTime: post.frontmatter.updatedAt,
      tags: post.frontmatter.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      images: [`/blog/${slug}/opengraph-image`],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const { frontmatter, content, readingTime } = post;
  const [body, headings, posts] = await Promise.all([
    renderMarkdown(content),
    extractHeadings(content),
    getAllPosts(),
  ]);

  const index = posts.findIndex((entry) => entry.slug === slug);
  const newer = index > 0 ? posts[index - 1] : null;
  const older = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;
  const edited = frontmatter.updatedAt !== frontmatter.createdAt;

  const jsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.createdAt,
    dateModified: frontmatter.updatedAt,
    url: `https://thesonofnyx.vercel.app/blog/${slug}`,
    author: {
      "@type": "Person",
      name: "Hazel",
      url: "https://thesonofnyx.vercel.app/",
    },
    keywords: frontmatter.tags.join(", "),
  };

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto flex w-full max-w-6xl justify-center gap-10 px-5 py-5">
        <aside className="hidden w-56 shrink-0 xl:block">
          <div className="sticky top-24">
            <TableOfContents headings={headings} />
          </div>
        </aside>

        <div className="relative z-10 flex w-full min-w-0 max-w-3xl flex-col">
          <Button variant="ghost" className="mb-6 self-start" asChild>
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to blog
            </Link>
          </Button>

          <header className="mb-8 flex flex-col items-center gap-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
              {frontmatter.title}
            </h1>

            {frontmatter.description && (
              <p className="max-w-2xl text-balance text-muted-foreground">
                {frontmatter.description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <PencilLine className="size-3.5" />
                Published {formatDate(frontmatter.createdAt)}
              </span>
              {edited && (
                <span>· Updated {formatDate(frontmatter.updatedAt)}</span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Estimated {readingTime}
              </span>
            </div>

            <CopyLinkButton />

            {frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-[0.65rem] text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <article
            className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-semibold prose-a:text-foreground prose-a:decoration-border prose-a:underline-offset-4 hover:prose-a:decoration-foreground prose-blockquote:border-l-border prose-blockquote:text-muted-foreground prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 prose-img:rounded-lg"
          >
            {body}
          </article>

          {(newer || older) && (
            <nav
              aria-label="More posts"
              className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
            >
              {newer ? (
                <Link
                  href={`/blog/${newer.slug}`}
                  className="group flex flex-col gap-1 rounded-lg border border-border bg-secondary/20 p-4 transition-colors hover:bg-secondary/40"
                >
                  <span className="flex items-center gap-1.5 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                    <ArrowLeft className="size-3" /> Newer
                  </span>
                  <span className="text-sm font-medium group-hover:underline">
                    {newer.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}

              {older && (
                <Link
                  href={`/blog/${older.slug}`}
                  className="group flex flex-col items-end gap-1 rounded-lg border border-border bg-secondary/20 p-4 text-right transition-colors hover:bg-secondary/40 sm:items-end"
                >
                  <span className="flex items-center gap-1.5 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                    Older <ArrowRight className="size-3" />
                  </span>
                  <span className="text-sm font-medium group-hover:underline">
                    {older.title}
                  </span>
                </Link>
              )}
            </nav>
          )}

          <div className="mt-10">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/blog" className="flex items-center gap-2">
                <ArrowLeft className="size-4" />
                All posts
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <TextScroll
        className="py-24 text-5xl font-bold text-muted-foreground/50 md:space-y-2 md:text-7xl dark:font-semibold"
        textClassName="py-1 md:py-3 font-doto"
        default_velocity={0.66}
        text="YOU'VE REACHED THE END, CUH."
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
