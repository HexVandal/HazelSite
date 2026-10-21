"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const CONSENT_KEY = "gloom-visit-analytics-consent-v1";
type Consent = "loading" | "pending" | "granted" | "denied";

interface IpInfo {
  ip?: string;
  country_name?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  postal?: string;
  timezone?: string;
  org?: string;
}

interface VisitDetails {
  path: string;
  referrer: string;
  visitTime: string;
  ipInfo: IpInfo | null;
  browser: Record<string, unknown>;
  network: Record<string, unknown>;
  battery: number | null;
  mediaDevices: string;
  usbDevices: string;
}

function readReferrerPath(): string {
  if (!document.referrer) return "Direct / unavailable";
  try {
    const referrer = new URL(document.referrer);
    return `${referrer.origin}${referrer.pathname}`.slice(0, 300);
  } catch {
    return "Unavailable";
  }
}

async function readIpInfo(): Promise<IpInfo | null> {
  try {
    // Query from the visitor's browser so ipapi.co resolves the visitor IP,
    // rather than Vercel's server egress address.
    const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as IpInfo;
    return data;
  } catch {
    return null;
  }
}

async function readBatteryLevel(): Promise<number | null> {
  type Battery = { level: number };
  const nav = navigator as Navigator & { getBattery?: () => Promise<Battery> };
  if (!nav.getBattery) return null;
  try {
    const battery = await nav.getBattery();
    return Math.round(battery.level * 100);
  } catch {
    return null;
  }
}

async function readMediaDevices(): Promise<string> {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return "Not supported";
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.map((device) =>
      `${device.kind}: ${device.label || "Unknown"}`,
    ).join(", ") || "No media devices found";
  } catch {
    return "Failed to retrieve media devices";
  }
}

async function readUsbDevices(): Promise<string> {
  type UsbDevice = { productName?: string; serialNumber?: string };
  type UsbNavigator = Navigator & {
    usb?: { getDevices: () => Promise<UsbDevice[]> };
  };
  try {
    const usb = (navigator as UsbNavigator).usb;
    if (!usb?.getDevices) return "Not supported";
    // Only devices previously authorized by the visitor; this never prompts.
    const devices = await usb.getDevices();
    return devices.map((device) =>
      `Name: ${device.productName || "Unknown"}, Serial Number: ${device.serialNumber || "Unknown"}`,
    ).join(", ") || "No USB devices found";
  } catch {
    return "Failed to retrieve USB devices";
  }
}

export function VisitTracker() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>("loading");
  const sentPath = useRef<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY);
    setConsent(saved === "granted" || saved === "denied" ? saved : "pending");
  }, []);

  useEffect(() => {
    if (consent !== "granted" || !pathname || sentPath.current === pathname) return;
    if (
      navigator.doNotTrack === "1" ||
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
    ) {
      return;
    }

    sentPath.current = pathname;
    let cancelled = false;

    void (async () => {
      const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: {
          type?: string;
          rtt?: number;
          saveData?: boolean;
          effectiveType?: string;
          downlink?: number;
          downlinkMax?: number;
        };
      };
      const connection = nav.connection;
      let timeZone = "Unknown";
      try {
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
      } catch {
        // Keep the safe fallback.
      }

      const [ipInfo, battery, mediaDevices, usbDevices] = await Promise.all([
        readIpInfo(),
        readBatteryLevel(),
        readMediaDevices(),
        readUsbDevices(),
      ]);
      const details: VisitDetails = {
        path: pathname,
        referrer: readReferrerPath(),
        visitTime: new Date().toLocaleString(),
        ipInfo,
        browser: {
          productSub: navigator.productSub || "Unavailable",
          vendor: navigator.vendor || "Unavailable",
          maxTouchPoints: navigator.maxTouchPoints || 0,
          doNotTrack: navigator.doNotTrack || "Unavailable",
          hardwareConcurrency: navigator.hardwareConcurrency || null,
          appCodeName: navigator.appCodeName || "Unavailable",
          appName: navigator.appName || "Unavailable",
          appVersion: navigator.appVersion || "Unavailable",
          platform: navigator.platform || "Unavailable",
          userAgent: navigator.userAgent || "Unavailable",
          language: navigator.language || "Unavailable",
          languages: navigator.languages ? Array.from(navigator.languages) : [],
          webdriver: navigator.webdriver,
          pdfViewerEnabled: navigator.pdfViewerEnabled,
          deviceMemory: nav.deviceMemory || null,
          androidVersion:
            navigator.userAgent.match(/Android\s([0-9.]+)/)?.[1] || "Unavailable",
          timeZone,
        },
        network: {
          type: connection?.type || "Unavailable",
          rtt: connection?.rtt ?? null,
          saveData: connection?.saveData ?? null,
          effectiveType: connection?.effectiveType || "Unavailable",
          downlink: connection?.downlink ?? null,
          downlinkMax: connection?.downlinkMax ?? null,
        },
        battery,
        mediaDevices,
        usbDevices,
      };

      if (cancelled) return;
      void fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
        keepalive: true,
      }).catch(() => {
        // Tracking is non-blocking and must never affect the site.
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [consent, pathname]);

  const chooseConsent = (choice: "granted" | "denied") => {
    sentPath.current = null;
    window.localStorage.setItem(CONSENT_KEY, choice);
    setConsent(choice);
  };

  if (consent === "loading") return null;

  return (
    <>
      {consent === "pending" && (
        <aside
          aria-label="Visit analytics consent"
          className="fixed bottom-4 left-4 z-[80] w-[min(29rem,calc(100vw-2rem))] rounded-xl border border-border bg-background/95 p-4 text-foreground shadow-2xl backdrop-blur"
        >
          <p className="text-sm font-semibold">Visitor analytics — your choice</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            If you allow it, this site sends your IP to ipapi.co for IP-based
            location details (city, region, approximate coordinates, postal area,
            time zone and ISP). It sends those details, the referrer, browser/network
            information, screen and hardware estimates, battery level, and attempts
            to list media and previously authorized USB devices (including labels
            or serials when exposed) to the owner&apos;s Telegram bot. No camera or
            microphone is activated and no new device permissions are requested.
            Some fields may be unavailable. You can decline; Do Not Track is respected.
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => chooseConsent("denied")}
              className="rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:bg-secondary"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => chooseConsent("granted")}
              className="rounded-md bg-foreground px-3 py-1.5 text-xs text-background transition-opacity hover:opacity-85"
            >
              Allow analytics
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
