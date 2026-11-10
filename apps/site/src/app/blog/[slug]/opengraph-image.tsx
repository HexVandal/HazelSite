import { ImageResponse } from "next/og";

import { getPostBySlug } from "@/lib/posts";

export const alt = "Gloom blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.frontmatter.title ?? "A note from the void";
  const description = post?.frontmatter.description ?? "Words, experiments, and other late-night thoughts.";
  const tags = post?.frontmatter.tags.slice(0, 3) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "58px 68px",
          color: "#f5f5f5",
          background: "linear-gradient(135deg, #080808 0%, #171717 58%, #300b0b 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 27, fontWeight: 700 }}>
            gloom<span style={{ color: "#a3a3a3" }}>.</span>
          </div>
          <div style={{ fontSize: 16, letterSpacing: 5, color: "#a3a3a3" }}>NOTES FROM THE VOID</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1020 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            {title}
          </div>
          <div style={{ fontSize: 25, lineHeight: 1.4, color: "#b5b5b5", maxWidth: 900 }}>
            {description}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  border: "1px solid #454545",
                  borderRadius: 999,
                  color: "#d4d4d4",
                  padding: "7px 14px",
                  fontSize: 15,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 15, color: "#737373" }}>thesonofnyx.vercel.app</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
