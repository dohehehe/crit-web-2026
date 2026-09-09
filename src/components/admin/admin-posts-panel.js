"use client";

import { useMemo, useState } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import { AdminSectionTabs } from "./admin-section-tabs";
import { AdminCategoryTabs } from "./admin-category-tabs";
import { AdminIssuesList } from "./admin-issues-list";
import { AdminPostsTable } from "./admin-posts-table";
import styles from "./admin-posts-panel.module.css";

const CURRENT_SECTION_SLUG = "Current";
const JOURNAL_CRIT_SECTION_SLUG = "Journal Crit";
const CHANNEL_SECTION_SLUG = "Channel";
const WORKSHOP_SECTION_SLUG = "Workshop";

function getSectionMode(section) {
  if (section?.slug === JOURNAL_CRIT_SECTION_SLUG) return "journal";
  if (section?.slug === CURRENT_SECTION_SLUG) return "current";
  if (section?.slug === CHANNEL_SECTION_SLUG || section?.slug === WORKSHOP_SECTION_SLUG) {
    return "posts";
  }
  return "posts";
}

export function AdminPostsPanel() {
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const {
    data: sectionsData,
    isLoading: sectionsLoading,
    error: sectionsError,
  } = useApiQuery("sections", {
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
  } = useApiQuery("categories", {
    params: {
      "eq.section_id": selectedSectionId,
      select: "id,name,slug,sort_order",
      order: "sort_order.asc",
      limit: 100,
    },
    enabled: Boolean(selectedSectionId) && sectionMode === "current",
  });

  const categories = categoriesData?.items ?? [];

  const {
    data: issuesData,
    isLoading: issuesLoading,
    error: issuesError,
  } = useApiQuery("issues", {
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
      select: "id,title,is_active,issue_id,authors(name)",
      order: "created_at.desc",
      limit: 100,
      "eq.section_id": selectedSectionId,
    };

    if (sectionMode === "current" && selectedCategoryId) {
      return { ...base, "eq.category_id": selectedCategoryId };
    }

    return base;
  }, [sectionMode, selectedCategoryId, selectedSectionId]);

  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
  } = useApiQuery("posts", {
    params: postsParams,
    enabled: Boolean(selectedSectionId),
  });

  const posts = postsData?.items ?? [];

  function handleSectionSelect(sectionId) {
    setSelectedSectionId(sectionId);
    setSelectedCategoryId(null);
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

  const listError = categoriesError ?? issuesError ?? postsError;
  const isListLoading =
    Boolean(selectedSectionId) &&
    (postsLoading || (sectionMode === "journal" && issuesLoading));

  const showPostsTable =
    (sectionMode === "current" || sectionMode === "posts") &&
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

        {selectedSectionId && sectionMode === "current" && !categoriesLoading && (
          <AdminCategoryTabs
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
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

        {showPostsTable && <AdminPostsTable posts={posts} />}
        {showJournalIssuesList && <AdminIssuesList issues={issues} posts={posts} />}
      </div>
    </div>
  );
}
