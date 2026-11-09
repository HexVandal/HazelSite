import type { Metadata, Viewport } from "next";
import { Doto, Geist, Geist_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Navbar } from "@/components/navbar";
import { FAB } from "@/components/fab";
import Providers from "@/lib/provider/react-query";

import "../app/globals.css";
import TargetCursor from "@/components/TargetCursor";
import { SmoothScroll } from "@/components/smooth-scroll";
import { VisitTracker } from "@/components/visit-tracker";

// import OgImage from "./opengraph-image.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "gloom.",
    template: "%s | gloom.",
  },
  description: "A little corner for writing, making, and being a work in progress.",
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://thesonofnyx.vercel.app"
      : "http://localhost:3000",
  ),
  openGraph: {
    title: {
      default: "gloom.",
      template: "%s | gloom.",
    },
    description: "Stuffs I put.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ocyeanyx",
    creator: "@ocyeanyx",
    images: ["/opengraph-image"],
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${doto.variable} antialiased`}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Providers>
              <SmoothScroll />
              <VisitTracker />
              <TargetCursor
                targetSelector="a, button, [role='button'], input, textarea, select, [tabindex]:not([tabindex='-1'])"
                cursorColor="#e8e2ef"
                cursorColorOnTarget="#baa1d4"
                size={34}
                cornerSize={10}
                thickness={2}
                padding={5}
                dotSize={3}
                spinDuration={2.6}
                hoverDuration={0.18}
                matchRadius
                parallaxOn
                hideDefaultCursor
                showLabel={false}
                clickEffect
              />
              <Navbar />
              {children}
              <FAB />
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}