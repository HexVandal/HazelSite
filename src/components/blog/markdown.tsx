import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as prod from "react/jsx-runtime";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeReact from "rehype-react";
import rehypeSlug from "rehype-slug";
import remarkFlexibleToc, { type TocItem } from "remark-flexible-toc";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { CopyButton } from "@/components/blog/copy-button";
import type { Heading } from "@/components/blog/table-of-contents";
import { cn } from "@/lib/utils";

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  children?: HastNode[];
  properties?: Record<string, unknown>;
}

/**
 * Stashes the raw code of every <pre> on the node so the client copy button
 * does not have to scrape colours and line numbers out of the DOM.
 */
function rehypeExtractRawCode() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "pre") {
        const codeNode = node.children?.find(
          (child) => child.tagName === "code",
        );

        if (codeNode) {
          const extractText = (child: HastNode): string => {
            if (child.type === "text") return child.value ?? "";
            if (child.children) return child.children.map(extractText).join("");
            return "";
          };

          node.properties = node.properties ?? {};
          node.properties["data-raw-code"] = extractText(codeNode);
        }
      }

      node.children?.forEach(walk);
    };

    walk(tree);
  };
}

const prettyCodeOptions: PrettyCodeOptions = {
  keepBackground: false,
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
};

function MarkdownPre({
  children,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  const rawCode =
    ((props as Record<string, unknown>)["data-raw-code"] as string) ?? "";

  return (
    <div className="group relative my-6">
      <pre
        {...props}
        className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-[0.8rem] leading-relaxed"
      >
        {children}
      </pre>
      {rawCode ? <CopyButton code={rawCode} /> : null}
    </div>
  );
}

const markdownComponents = {
  pre: MarkdownPre,
  a: ({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) => {
    const isExternal = /^https?:\/\//.test(href);

    return (
      <a
        href={href}
        {...props}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt, title }: ComponentPropsWithoutRef<"img">) => {
    if (typeof src !== "string") return null;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        title={title}
        loading="lazy"
        className="my-6 h-auto w-full rounded-lg border border-border"
      />
    );
  },
  table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-left text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: ComponentPropsWithoutRef<"thead">) => (
    <thead className="border-b border-border bg-muted/60" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th className="px-3.5 py-2.5 font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td className="border-t border-border/60 px-3.5 py-2.5" {...props}>
      {children}
    </td>
  ),
  hr: () => <hr className="my-8 border-border" />,
};

/** Renders a markdown post body into React nodes. */
export async function renderMarkdown(source: string): Promise<ReactNode> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeExtractRawCode)
    .use(rehypeReact, {
      Fragment: prod.Fragment,
      jsx: prod.jsx,
      jsxs: prod.jsxs,
      components: markdownComponents,
    });

  const file = await processor.process(source);

  return file.result as ReactNode;
}

/** Collects h2/h3 headings so they can be rendered in the table of contents. */
export async function extractHeadings(source: string): Promise<Heading[]> {
  const toc: TocItem[] = [];

  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkFlexibleToc, { tocRef: toc, maxDepth: 3 });

    const ast = processor.parse(source);
    await processor.run(ast);

    return toc.map((item) => ({
      id: item.href.replace(/^#/, ""),
      text: item.value,
      level: item.depth,
    }));
  } catch (error) {
    console.error("Failed to extract headings:", error);
    return [];
  }
}

export { cn };
