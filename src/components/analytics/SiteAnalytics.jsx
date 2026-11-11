"use client";

import { Analytics } from "@vercel/analytics/next";
import { isAdminRoute } from "@/lib/analytics/publicPageviews";

export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        if (isAdminRoute(event.url)) {
          return null;
        }

        return event;
      }}
    />
  );
}
