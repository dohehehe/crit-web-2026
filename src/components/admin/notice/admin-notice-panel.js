"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { AdminSectionTabs } from "@/components/admin/shared/admin-section-tabs";
import { AdminNoticeTable } from "@/components/admin/notice/admin-notice-table";
import { AdminNoticePopupTable } from "@/components/admin/notice/admin-notice-popup-table";
import { AdminNoticeBannerTable } from "@/components/admin/notice/admin-notice-banner-table";
import styles from "@/components/admin/shared/admin-posts-panel.module.css";

const NOTICE_TABS = [
  { id: "notice", label: "공지" },
  { id: "popup", label: "팝업" },
  { id: "banner", label: "배너" },
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

  const {
    data: bannersData,
    isLoading: bannersLoading,
    error: bannersError,
  } = useAdminQuery("banner", {
    params: {
      select: "id,link_url,is_active,created_at",
      order: "created_at.desc",
      limit: 100,
    },
    enabled: selectedTab === "banner",
  });

  const notices = noticesData?.items ?? [];
  const popups = popupsData?.items ?? [];
  const banners = bannersData?.items ?? [];

  const isLoading =
    selectedTab === "notice"
      ? noticesLoading
      : selectedTab === "popup"
        ? popupsLoading
        : bannersLoading;

  const error =
    selectedTab === "notice"
      ? noticesError
      : selectedTab === "popup"
        ? popupsError
        : bannersError;

  const createHref =
    selectedTab === "notice"
      ? "/admin/notice/new"
      : selectedTab === "popup"
        ? "/admin/notice/popup/new"
        : "/admin/notice/banner/new";

  const createLabel =
    selectedTab === "notice"
      ? "+ 새 공지"
      : selectedTab === "popup"
        ? "+ 새 팝업"
        : "+ 새 배너";

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
              <Link href={createHref} className={`${styles.createButton} caption`}>
                {createLabel}
              </Link>
            </div>

            {selectedTab === "notice" && <AdminNoticeTable notices={notices} />}
            {selectedTab === "popup" && <AdminNoticePopupTable popups={popups} />}
            {selectedTab === "banner" && <AdminNoticeBannerTable banners={banners} />}
          </>
        )}
      </div>
    </div>
  );
}
