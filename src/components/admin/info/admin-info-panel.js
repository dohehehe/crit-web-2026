"use client";

import { useMemo, useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { getRoleLabel } from "@/lib/auth/roleLabels";
import { AdminSectionTabs } from "@/components/admin/shared/admin-section-tabs";
import { AdminCategoryTabs } from "@/components/admin/shared/admin-category-tabs";
import { InfoForm } from "@/components/admin/info/info-form";
import { AdminUsersTable } from "@/components/admin/info/admin-users-table";
import styles from "@/components/admin/shared/admin-posts-panel.module.css";

const INFO_TABS = [
  { id: "info", label: "정보" },
  { id: "users", label: "사용자" },
];

export function AdminInfoPanel() {
  const [selectedTab, setSelectedTab] = useState("info");
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useAdminQuery("roles", {
    params: {
      select: "id,name,created_at",
      order: "created_at.asc",
      limit: 100,
    },
    enabled: selectedTab === "users",
  });

  const userParams = useMemo(() => {
    const params = {
      select: "id,name,email,created_at,role_id,roles(name)",
      order: "created_at.desc",
      limit: 100,
    };

    if (selectedRoleId) {
      params["eq.role_id"] = selectedRoleId;
    }

    return params;
  }, [selectedRoleId]);

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useAdminQuery("users", {
    params: userParams,
    enabled: selectedTab === "users",
  });

  const roles = rolesData?.items ?? [];
  const users = usersData?.items ?? [];
  const roleTabs = roles.map((role) => ({
    id: role.id,
    name: getRoleLabel(role.name),
    slug: role.name,
  }));

  const isLoading = rolesLoading || usersLoading;
  const error = rolesError ?? usersError;

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
            <AdminCategoryTabs
              categories={roleTabs}
              selectedId={selectedRoleId}
              onSelect={setSelectedRoleId}
              ariaLabel="역할"
            />

            {isLoading && (
              <p className={`${styles.status} caption gray-65`}>
                목록 불러오는 중…
              </p>
            )}

            {error && (
              <p className={`${styles.status} caption`}>
                목록을 불러오지 못했습니다: {error.message}
              </p>
            )}

            {!isLoading && !error && <AdminUsersTable users={users} />}
          </>
        )}
      </div>
    </div>
  );
}
