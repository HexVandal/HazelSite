"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";

type SiteLinkProps = ComponentProps<typeof NextLink>;

/** Standard Next.js navigation avoids stalled DOM view transitions in embeds. */
export function SiteLink(props: SiteLinkProps) {
  return <NextLink {...props} />;
}
