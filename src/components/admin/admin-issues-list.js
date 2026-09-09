"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  buildIssueEditHref,
  buildPostCreateHref,
} from "@/lib/admin/section-mode";
import { AdminJournalPostsTable } from "./admin-journal-posts-table";
import styles from "./admin-issues-list.module.css";

const UNASSIGNED_ISSUE_ID = "__unassigned__";

function formatIssueLabel(issue) {
  if (issue.issue_number && issue.title) {
    return `Vol. ${issue.issue_number} — ${issue.title}`;
  }

  return issue.title || issue.issue_number || "제목 없음";
}

function formatActiveStatus(isActive) {
  return isActive ? "활성" : "비활성";
}

export function AdminIssuesList({ issues, posts, sectionId, onPostsChanged }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const postsByIssueId = useMemo(() => {
    const map = new Map();

    for (const post of posts) {
      const key = post.issue_id ?? UNASSIGNED_ISSUE_ID;
      const group = map.get(key) ?? [];
      group.push(post);
      map.set(key, group);
    }

    return map;
  }, [posts]);

  const unassignedPosts = postsByIssueId.get(UNASSIGNED_ISSUE_ID) ?? [];

  function toggleIssue(issueId) {
    setExpandedIds((prev) => {
      const next = new Set(prev);

      if (next.has(issueId)) {
        next.delete(issueId);
      } else {
        next.add(issueId);
      }

      return next;
    });
  }

  if (issues.length === 0 && unassignedPosts.length === 0) {
    return <p className={`${styles.empty} caption gray-65`}>등록된 이슈가 없습니다.</p>;
  }

  return (
    <ul className={styles.list}>
      {issues.map((issue) => {
        const isExpanded = expandedIds.has(issue.id);
        const issuePosts = postsByIssueId.get(issue.id) ?? [];

        return (
          <li key={issue.id} className={styles.item}>
            <div className={styles.issueHeader}>
              <button
                type="button"
                className={`${styles.issueButton} ${isExpanded ? styles.issueButtonExpanded : ""}`}
                aria-expanded={isExpanded}
                onClick={() => toggleIssue(issue.id)}
              >
                <span className={`${styles.issueLabel} p-bold`}>{formatIssueLabel(issue)}</span>
                <span className={`${styles.meta} caption gray-65`}>
                  <span
                    className={`${styles.status} ${
                      issue.is_active ? styles.statusActive : styles.statusInactive
                    }`}
                  >
                    {formatActiveStatus(Boolean(issue.is_active))}
                  </span>
                  <span>{issuePosts.length}개</span>
                  <span className={styles.chevron} aria-hidden="true">
                    {isExpanded ? "−" : "+"}
                  </span>
                </span>
              </button>
              <Link
                href={buildIssueEditHref(issue.id)}
                className={`${styles.editButton} caption`}
              >
                수정
              </Link>
            </div>

            {isExpanded && (
              <div className={styles.postsPanel}>
                {sectionId && (
                  <div className={styles.issueToolbar}>
                    <Link
                      href={buildPostCreateHref(sectionId, { issueId: issue.id })}
                      className={`${styles.createButton} caption`}
                    >
                      + 새 게시물
                    </Link>
                  </div>
                )}
                <AdminJournalPostsTable
                  posts={issuePosts}
                  onPostsChanged={onPostsChanged}
                />
              </div>
            )}
          </li>
        );
      })}

      {unassignedPosts.length > 0 && (
        <li className={styles.item}>
          <button
            type="button"
            className={`${styles.issueButton} ${
              expandedIds.has(UNASSIGNED_ISSUE_ID) ? styles.issueButtonExpanded : ""
            }`}
            aria-expanded={expandedIds.has(UNASSIGNED_ISSUE_ID)}
            onClick={() => toggleIssue(UNASSIGNED_ISSUE_ID)}
          >
            <span className={`${styles.issueLabel} p-bold`}>이슈 미지정</span>
            <span className={`${styles.meta} caption gray-65`}>
              <span>{unassignedPosts.length}개</span>
              <span className={styles.chevron} aria-hidden="true">
                {expandedIds.has(UNASSIGNED_ISSUE_ID) ? "−" : "+"}
              </span>
            </span>
          </button>

          {expandedIds.has(UNASSIGNED_ISSUE_ID) && (
            <div className={styles.postsPanel}>
              {sectionId && (
                <div className={styles.issueToolbar}>
                  <Link
                    href={buildPostCreateHref(sectionId)}
                    className={`${styles.createButton} caption`}
                  >
                    + 새 게시물
                  </Link>
                </div>
              )}
              <AdminJournalPostsTable
                posts={unassignedPosts}
                onPostsChanged={onPostsChanged}
              />
            </div>
          )}
        </li>
      )}
    </ul>
  );
}
