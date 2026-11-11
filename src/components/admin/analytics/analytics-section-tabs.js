"use client";

import { AdminSectionTabs } from "@/components/admin/shared/admin-section-tabs";

export function AnalyticsSectionTabs({ sections, selectedId, sort = "date" }) {
  return (
    <AdminSectionTabs
      sections={sections}
      selectedId={selectedId}
      hrefFor={(id) => {
        const params = new URLSearchParams({ range: "all", section: id });

        if (sort === "views") {
          params.set("sort", "views");
        }

        return `/admin/analytics?${params.toString()}`;
      }}
    />
  );
}
