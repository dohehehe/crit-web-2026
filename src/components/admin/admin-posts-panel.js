"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import {
  buildIssueCreateHref,
  buildPostCreateHref,
  getSectionMode,
  sectionUsesCategoryManagement,
  sectionUsesCategoryTabs,
  sectionUsesIssuePostSortOrder,
  sectionUsesWorkshopStatusTabs,
} from "@/lib/admin/section-mode";
import { filterPostsByWorkshopStatus } from "@/lib/admin/workshop-status";
import { AdminSectionTabs } from "./admin-section-tabs";
import { AdminCategoryBar } from "./admin-category-bar";
import { AdminCategoryManager } from "./admin-category-manager";
import { AdminWorkshopStatusTabs } from "./admin-workshop-status-tabs";
import { AdminIssuesList } from "./admin-issues-list";
import { AdminPostsTable } from "./admin-posts-table";
import styles from "./admin-posts-panel.module.css";

export function AdminPostsPanel() {
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedWorkshopStatus, setSelectedWorkshopStatus] = useState(null);

  const {
    data: sectionsData,
    isLoading: sectionsLoading,
    error: sectionsError,
  } = useAdminQuery("sections", {
    params: {
      order: "sort_order.asc",
      limit: 20,
    },
  });

  const sections = sectionsData?.items ?? [];
  const selectedSection = sections.find((section) => section.id === selectedSectionId) ?? null;
  const sectionMode = getSectionMode(selectedSection);

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useAdminQuery("categories", {
    params: {
      "eq.section_id": selectedSectionId,
      select: "id,name,slug,sort_order,is_active",
      order: "sort_order.asc",
      limit: 100,
    },
    enabled:
      Boolean(selectedSectionId) &&
      (sectionUsesCategoryTabs(sectionMode) || sectionUsesCategoryManagement(sectionMode)),
  });

  const categories = categoriesData?.items ?? [];

  const {
    data: issuesData,
    isLoading: issuesLoading,
    error: issuesError,
  } = useAdminQuery("issues", {
    params: {
      select: "id,title,issue_number,is_active",
      order: "issue_number.desc",
      limit: 100,
    },
    enabled: Boolean(selectedSectionId) && sectionMode === "journal",
  });

  const issues = issuesData?.items ?? [];

  const postsParams = useMemo(() => {
    const base = {
      select: "id,title,date,is_active,issue_id,authors(name)",
      order: "date.desc",
      limit: 100,
      "eq.section_id": selectedSectionId,
    };

    if (sectionUsesWorkshopStatusTabs(sectionMode)) {
      base.select = "id,title,date,is_active,issue_id,authors(name),start_at,end_at";
    }

    if (sectionUsesIssuePostSortOrder(sectionMode)) {
      base.select = "id,title,date,is_active,issue_id,authors(name),sort_order";
      base.order = "sort_order.asc";
    }

    if (sectionUsesCategoryTabs(sectionMode) && selectedCategoryId) {
      return { ...base, "eq.category_id": selectedCategoryId };
    }

    return base;
  }, [sectionMode, selectedCategoryId, selectedSectionId]);

  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useAdminQuery("posts", {
    params: postsParams,
    enabled: Boolean(selectedSectionId),
  });

  const posts = postsData?.items ?? [];

  const visiblePosts = useMemo(() => {
    if (!sectionUsesWorkshopStatusTabs(sectionMode)) {
      return posts;
    }

    return filterPostsByWorkshopStatus(posts, selectedWorkshopStatus);
  }, [posts, sectionMode, selectedWorkshopStatus]);

  function handleSectionSelect(sectionId) {
    setSelectedSectionId(sectionId);
    setSelectedCategoryId(null);
    setSelectedWorkshopStatus(null);
  }

  if (sectionsLoading) {
    return <p className={`${styles.status} caption gray-65`}>섹션 불러오는 중…</p>;
  }

  if (sectionsError) {
    return (
      <p className={`${styles.status} caption`}>
        섹션을 불러오지 못했습니다: {sectionsError.message}
      </p>
    );
  }

  if (sections.length === 0) {
    return <p className={`${styles.status} caption gray-65`}>등록된 섹션이 없습니다.</p>;
  }

  const listError =
    (sectionUsesCategoryTabs(sectionMode) ? categoriesError : null) ??
    issuesError ??
    postsError;
  const isListLoading =
    Boolean(selectedSectionId) &&
    (postsLoading ||
      (sectionMode === "journal" && issuesLoading) ||
      (sectionUsesCategoryTabs(sectionMode) && categoriesLoading));

  const showPostsTable =
    (sectionUsesCategoryTabs(sectionMode) ||
      sectionUsesWorkshopStatusTabs(sectionMode) ||
      sectionMode === "posts") &&
    selectedSectionId &&
    !isListLoading &&
    !listError;

  const showJournalIssuesList =
    sectionMode === "journal" && selectedSectionId && !isListLoading && !listError;

  return (
    <div className={styles.panel}>
      <AdminSectionTabs
        sections={sections}
        selectedId={selectedSectionId}
        onSelect={handleSectionSelect}
      />

      <div className={styles.content} role="tabpanel">
        {!selectedSectionId && (
          <p className={`${styles.status} caption gray-65`}>섹션을 선택하면 목록이 표시됩니다.</p>
        )}

        {selectedSectionId &&
          sectionUsesCategoryTabs(sectionMode) &&
          !isListLoading &&
          !listError && (
          <AdminCategoryBar
            sectionId={selectedSectionId}
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            onChanged={refetchCategories}
          />
        )}

        {selectedSectionId && sectionUsesCategoryManagement(sectionMode) && (
          <>
            {categoriesLoading && (
              <p className={`${styles.status} caption gray-65`}>카테고리 불러오는 중…</p>
            )}
            {categoriesError && (
              <p className={`${styles.status} caption`}>
                카테고리를 불러오지 못했습니다: {categoriesError.message}
              </p>
            )}
            {!categoriesLoading && !categoriesError && (
              <AdminCategoryManager
                sectionId={selectedSectionId}
                categories={categories}
                onChanged={refetchCategories}
              />
            )}
          </>
        )}

        {selectedSectionId &&
          sectionUsesWorkshopStatusTabs(sectionMode) &&
          !isListLoading &&
          !listError && (
          <AdminWorkshopStatusTabs
            selectedStatus={selectedWorkshopStatus}
            onSelect={setSelectedWorkshopStatus}
          />
        )}

        {selectedSectionId && isListLoading && (
          <p className={`${styles.status} caption gray-65`}>목록 불러오는 중…</p>
        )}

        {selectedSectionId && listError && (
          <p className={`${styles.status} caption`}>
            목록을 불러오지 못했습니다: {listError.message}
          </p>
        )}

        {selectedSectionId && !isListLoading && !listError && (
          <div className={styles.toolbar}>
            {sectionMode === "journal" ? (
              <Link href={buildIssueCreateHref()} className={`${styles.createButton} caption`}>
                + 새 이슈
              </Link>
            ) : (
              <Link
                href={buildPostCreateHref(selectedSectionId, {
                  categoryId: sectionUsesCategoryTabs(sectionMode) ? selectedCategoryId : null,
                })}
                className={`${styles.createButton} caption`}
              >
                + 새 게시물
              </Link>
            )}
          </div>
        )}

        {showPostsTable && <AdminPostsTable posts={visiblePosts} />}
        {showJournalIssuesList && (
          <AdminIssuesList
            issues={issues}
            posts={posts}
            sectionId={selectedSectionId}
            onPostsChanged={refetchPosts}
          />
        )}
      </div>
    </div>
  );
}
