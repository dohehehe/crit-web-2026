"use client";

import { useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { AdminSectionTabs } from "@/components/admin/shared/admin-section-tabs";
import { InfoForm } from "@/components/admin/info/info-form";
import { AdminUsersTable } from "@/components/admin/info/admin-users-table";
import styles from "@/components/admin/shared/admin-posts-panel.module.css";

const INFO_TABS = [
  { id: "info", label: "정보" },
  { id: "users", label: "사용자" },
];

export function AdminInfoPanel() {
  const [selectedTab, setSelectedTab] = useState("info");

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useAdminQuery("users", {
    params: {
      select: "id,name,email,created_at",
      order: "created_at.desc",
      limit: 100,
    },
    enabled: selectedTab === "users",
  });

  const users = usersData?.items ?? [];

  return (
    <div className={styles.panel}>
      <AdminSectionTabs
        sections={INFO_TABS.map((tab) => ({ id: tab.id, name: tab.label }))}
        selectedId={selectedTab}
        onSelect={setSelectedTab}
      />

      <div className={styles.content} role="tabpanel">
        {selectedTab === "info" && <InfoForm />}

        {selectedTab === "users" && (
          <>
            {usersLoading && (
              <p className={`${styles.status} caption gray-65`}>목록 불러오는 중…</p>
            )}

            {usersError && (
              <p className={`${styles.status} caption`}>
                목록을 불러오지 못했습니다: {usersError.message}
              </p>
            )}

            {!usersLoading && !usersError && <AdminUsersTable users={users} />}
          </>
        )}
      </div>
    </div>
  );
}
