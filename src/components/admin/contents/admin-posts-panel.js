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
import {
  isKeywordsTabSelected,
  KEYWORDS_TAB,
} from "@/lib/admin/keywords-tab";
import { AdminSectionTabs } from "@/components/admin/shared/admin-section-tabs";
import { AdminKeywordsTable } from "@/components/admin/contents/admin-keywords-table";
import { AdminCategoryBar } from "@/components/admin/contents/category/admin-category-bar";
import { AdminCategoryManager } from "@/components/admin/contents/category/admin-category-manager";
import { AdminWorkshopStatusTabs } from "@/components/admin/contents/admin-workshop-status-tabs";
import { AdminIssuesList } from "@/components/admin/contents/admin-issues-list";
import { AdminPostsTable } from "@/components/admin/contents/admin-posts-table";
import styles from "@/components/admin/shared/admin-posts-panel.module.css";

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
  const isKeywordsView = isKeywordsTabSelected(selectedSectionId);
  const selectedSection =
    sections.find((section) => section.id === selectedSectionId) ?? null;
  const sectionMode = getSectionMode(selectedSection);

  const {
    data: keywordsData,
    isLoading: keywordsLoading,
    error: keywordsError,
    refetch: refetchKeywords,
  } = useAdminQuery("keywords", {
    params: {
      select: "id,name,slug,post_keywords(count)",
      order: "name.asc",
      limit: 100,
    },
    enabled: isKeywordsView,
  });

  const keywords = keywordsData?.items ?? [];

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
      !isKeywordsView &&
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
    enabled: Boolean(selectedSectionId) && !isKeywordsView && sectionMode === "journal",
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
    enabled: Boolean(selectedSectionId) && !isKeywordsView,
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
    !isKeywordsView &&
    (postsLoading ||
      (sectionMode === "journal" && issuesLoading) ||
      (sectionUsesCategoryTabs(sectionMode) && categoriesLoading));

  const showPostsTable =
    !isKeywordsView &&
    (sectionUsesCategoryTabs(sectionMode) ||
      sectionUsesWorkshopStatusTabs(sectionMode) ||
      sectionMode === "posts") &&
    selectedSectionId &&
    !isListLoading &&
    !listError;

  const showJournalIssuesList =
    !isKeywordsView &&
    sectionMode === "journal" &&
    selectedSectionId &&
    !isListLoading &&
    !listError;

  return (
    <div className={styles.panel}>
      <AdminSectionTabs
        sections={sections}
        selectedId={selectedSectionId}
        onSelect={handleSectionSelect}
        trailingTabs={[KEYWORDS_TAB]}
      />

      <div className={styles.content} role="tabpanel">
        {!selectedSectionId && (
          <p className={`${styles.status} caption gray-65`}>섹션을 선택하면 목록이 표시됩니다.</p>
        )}

        {isKeywordsView && keywordsLoading && (
          <p className={`${styles.status} caption gray-65`}>키워드 불러오는 중…</p>
        )}

        {isKeywordsView && keywordsError && (
          <p className={`${styles.status} caption`}>
            키워드를 불러오지 못했습니다: {keywordsError.message}
          </p>
        )}

        {isKeywordsView && !keywordsLoading && !keywordsError && (
          <AdminKeywordsTable keywords={keywords} onChanged={refetchKeywords} />
        )}

        {selectedSectionId &&
          !isKeywordsView &&
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

        {selectedSectionId && !isKeywordsView && sectionUsesCategoryManagement(sectionMode) && (
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
          !isKeywordsView &&
          sectionUsesWorkshopStatusTabs(sectionMode) &&
          !isListLoading &&
          !listError && (
          <AdminWorkshopStatusTabs
            selectedStatus={selectedWorkshopStatus}
            onSelect={setSelectedWorkshopStatus}
          />
        )}

        {selectedSectionId && !isKeywordsView && isListLoading && (
          <p className={`${styles.status} caption gray-65`}>목록 불러오는 중…</p>
        )}

        {selectedSectionId && !isKeywordsView && listError && (
          <p className={`${styles.status} caption`}>
            목록을 불러오지 못했습니다: {listError.message}
          </p>
        )}

        {selectedSectionId && !isKeywordsView && !isListLoading && !listError && (
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
