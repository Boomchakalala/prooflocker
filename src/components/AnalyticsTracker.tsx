"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

    // Only track if GA_ID is configured and gtag is available
    if (!GA_ID || typeof window === "undefined" || !window.gtag) {
      return;
    }

    // Construct full URL with query params
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    // Fire pageview to GA4
    window.gtag("config", GA_ID, {
      page_path: url,
    });

    // Optional: Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[GA4] Pageview tracked:", url);
    }
  }, [pathname, searchParams]);

  return null;
}
