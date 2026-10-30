"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { getRoleLabel } from "@/lib/auth/roleLabels";
import { AdminSectionTabs } from "@/components/admin/shared/admin-section-tabs";
import { AdminCategoryTabs } from "@/components/admin/shared/admin-category-tabs";
import { AdminEditorsTable } from "@/components/admin/info/admin-editors-table";
import { InfoForm } from "@/components/admin/info/info-form";
import { AdminUsersTable } from "@/components/admin/info/admin-users-table";
import styles from "@/components/admin/shared/admin-posts-panel.module.css";

const INFO_TABS = [
  { id: "info", label: "정보" },
  { id: "editors", label: "에디터" },
  { id: "users", label: "사용자" },
];

const INFO_TAB_IDS = new Set(INFO_TABS.map((tab) => tab.id));

export function AdminInfoPanel({ initialTab = "info" }) {
  const [selectedTab, setSelectedTab] = useState(
    INFO_TAB_IDS.has(initialTab) ? initialTab : "info"
  );
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
    refetch: refetchUsers,
  } = useAdminQuery("users", {
    params: userParams,
    enabled: selectedTab === "users",
  });

  const {
    data: editorsData,
    isLoading: editorsLoading,
    error: editorsError,
    refetch: refetchEditors,
  } = useAdminQuery("editors", {
    params: {
      select: "id,name,name_en,order,created_at",
      order: "order.asc",
      limit: 100,
    },
    enabled: selectedTab === "editors",
  });

  const roles = rolesData?.items ?? [];
  const editors = editorsData?.items ?? [];
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

        {selectedTab === "editors" && (
          <>
            <div className={styles.toolbar}>
              <Link
                href="/admin/info/editors/new"
                className={`${styles.createButton} caption`}
              >
                + 새 에디터
              </Link>
            </div>

            {editorsLoading && !editorsData && (
              <p className={`${styles.status} caption gray-65`}>
                목록 불러오는 중…
              </p>
            )}

            {editorsError && !editorsData && (
              <p className={`${styles.status} caption`}>
                목록을 불러오지 못했습니다: {editorsError.message}
              </p>
            )}

            {editorsData && !editorsError && (
              <AdminEditorsTable editors={editors} onChanged={refetchEditors} />
            )}
          </>
        )}

        {selectedTab === "users" && (
          <>
            <AdminCategoryTabs
              categories={roleTabs}
              selectedId={selectedRoleId}
              onSelect={setSelectedRoleId}
              ariaLabel="역할"
            />

            {isLoading && !usersData && (
              <p className={`${styles.status} caption gray-65`}>
                목록 불러오는 중…
              </p>
            )}

            {error && !usersData && (
              <p className={`${styles.status} caption`}>
                목록을 불러오지 못했습니다: {error.message}
              </p>
            )}

            {usersData && !error && (
              <AdminUsersTable
                users={users}
                roles={roles}
                onChanged={refetchUsers}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
