"use client";

import { FileText, Image as ImageIcon, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Overview = {
  storage_configured?: boolean;
  posts: { total: number; published: number; drafts: number };
  messages: { total: number; latest_at: string | null };
  images: { total: number; bytes: number };
};

function StatCard({ title, value, detail, href, icon: Icon }: { title: string; value: string | number; detail: string; href: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      <Card className="h-full transition-colors hover:border-primary/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <CardDescription className="mt-1">{detail}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = React.useState<Overview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const response = await fetch("/api/overview", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load overview");
      setOverview(await response.json());
    } catch (error) {
      console.error(error);
      if (manual) toast.error("Overview could not be refreshed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  const storageConfigured = overview?.storage_configured !== false;
  const posts = overview?.posts;
  const messages = overview?.messages;
  const images = overview?.images;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Your blog content and contact inbox at a glance.</p>
          {!loading && !storageConfigured && (
            <p className="text-xs text-muted-foreground mt-1">
              Content storage isn&apos;t configured yet. Add CONTENT_BLOB_READ_WRITE_TOKEN to see post, message, and image counts.
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => void load(true)} disabled={refreshing} className="gap-1.5 text-xs">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Blog Posts" value={loading || !storageConfigured ? "—" : posts?.total ?? 0} detail={`${posts?.published ?? 0} published · ${posts?.drafts ?? 0} drafts`} href="/posts" icon={FileText} />
        <StatCard title="Contact Messages" value={loading || !storageConfigured ? "—" : messages?.total ?? 0} detail={messages?.latest_at ? `Latest ${new Date(messages.latest_at).toLocaleDateString()}` : "Your contact inbox"} href="/messages" icon={Mail} />
        <StatCard title="Blog Images" value={loading || !storageConfigured ? "—" : images?.total ?? 0} detail={`${((images?.bytes ?? 0) / (1024 * 1024)).toFixed(1)} MB stored`} href="/storage" icon={ImageIcon} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
          <CardDescription>Manage the parts of the site you use most.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button nativeButton={false} render={<Link href="/posts/new" />}>Write a post</Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/messages" />}>Open messages</Button>
          <Badge variant="secondary" className="self-center">Vercel storage</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
