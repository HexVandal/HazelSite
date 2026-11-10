import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Route the site's familiar /admin URL to the HQ app in this monorepo. */
export default function AdminEntry() {
  redirect(process.env.HQ_URL || "http://localhost:3001");
}
