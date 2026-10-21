export interface PostFrontmatter {
  /** Post title, rendered as the H1 and in listings. */
  title: string;
  /** Short summary shown on cards, in metadata and in OG tags. */
  description: string;
  /** ISO date the post was published, e.g. "2026-08-14". */
  createdAt: string;
  /** ISO date the post was last edited. Falls back to createdAt. */
  updatedAt: string;
  /** Free-form tags used by the filter chips. */
  tags: string[];
}

export interface Post extends PostFrontmatter {
  /** Filename without the extension, e.g. "hello-gloom". */
  slug: string;
  /** Human readable reading time, e.g. "4 min read". */
  readingTime: string;
  /** Reading time in minutes, used for sorting. */
  readingMinutes: number;
}

export interface PostSource {
  frontmatter: PostFrontmatter;
  /** Markdown body, frontmatter stripped. */
  content: string;
  readingTime: string;
  readingMinutes: number;
}
