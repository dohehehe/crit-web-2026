"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { AdminSectionTabs } from "@/components/admin/shared/admin-section-tabs";
import { AdminNoticeTable } from "@/components/admin/notice/admin-notice-table";
import { AdminNoticePopupTable } from "@/components/admin/notice/admin-notice-popup-table";
import styles from "@/components/admin/shared/admin-posts-panel.module.css";

const NOTICE_TABS = [
  { id: "notice", label: "공지" },
  { id: "popup", label: "팝업" },
];

export function AdminNoticePanel() {
  const [selectedTab, setSelectedTab] = useState("notice");

  const {
    data: noticesData,
    isLoading: noticesLoading,
    error: noticesError,
  } = useAdminQuery("notice", {
    params: {
      select: "id,title,date,is_active,created_at",
      order: "date.desc",
      limit: 100,
    },
    enabled: selectedTab === "notice",
  });

  const {
    data: popupsData,
    isLoading: popupsLoading,
    error: popupsError,
  } = useAdminQuery("notice_popup", {
    params: {
      select: "id,link_url,is_active,created_at",
      order: "created_at.desc",
      limit: 100,
    },
    enabled: selectedTab === "popup",
  });

  const notices = noticesData?.items ?? [];
  const popups = popupsData?.items ?? [];
  const isLoading = selectedTab === "notice" ? noticesLoading : popupsLoading;
  const error = selectedTab === "notice" ? noticesError : popupsError;

  return (
    <div className={styles.panel}>
      <AdminSectionTabs
        sections={NOTICE_TABS.map((tab) => ({ id: tab.id, name: tab.label }))}
        selectedId={selectedTab}
        onSelect={setSelectedTab}
      />

      <div className={styles.content} role="tabpanel">
        {isLoading && (
          <p className={`${styles.status} caption gray-65`}>목록 불러오는 중…</p>
        )}

        {error && (
          <p className={`${styles.status} caption`}>
            목록을 불러오지 못했습니다: {error.message}
          </p>
        )}

        {!isLoading && !error && (
          <>
            <div className={styles.toolbar}>
              {selectedTab === "notice" ? (
                <Link href="/admin/notice/new" className={`${styles.createButton} caption`}>
                  + 새 공지
                </Link>
              ) : (
                <Link href="/admin/notice/popup/new" className={`${styles.createButton} caption`}>
                  + 새 팝업
                </Link>
              )}
            </div>

            {selectedTab === "notice" ? (
              <AdminNoticeTable notices={notices} />
            ) : (
              <AdminNoticePopupTable popups={popups} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
