import { BarChart3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Visitor Analytics</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Privacy-friendly aggregate website traffic.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vercel Web Analytics</CardTitle>
          <CardDescription>Traffic analytics are collected by Vercel for the public site. View page views and visitor trends in your Vercel project dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button nativeButton={false} render={<a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" />}>
            Open Vercel Dashboard <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
