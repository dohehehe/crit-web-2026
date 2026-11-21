"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PostList } from "@/components/posts/PostList";
import styles from "./HomePostList.module.css";

export function HomePostList({ initialPosts, initialHasMore, pageSize }) {
  const [posts, setPosts] = useState(initialPosts);
  const [offset, setOffset] = useState(initialPosts.length);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const activeRef = useRef(true);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError(false);

    try {
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(pageSize),
      });
      const response = await fetch(`/api/posts?${params}`);
      const payload = await response.json();

      if (!activeRef.current) {
        return;
      }

      if (!response.ok || !payload.ok || !Array.isArray(payload.data)) {
        throw new Error("Failed to load posts");
      }

      const nextPosts = payload.data;

      setPosts((current) => {
        const seen = new Set(current.map((post) => post.id));
        const appended = nextPosts.filter((post) => !seen.has(post.id));

        return appended.length > 0 ? [...current, ...appended] : current;
      });
      setOffset((current) => current + nextPosts.length);
      setHasMore(nextPosts.length === pageSize);
    } catch {
      if (activeRef.current) {
        setError(true);
      }
    } finally {
      loadingRef.current = false;

      if (activeRef.current) {
        setLoading(false);
      }
    }
  }, [hasMore, offset, pageSize]);

  useEffect(() => {
    activeRef.current = true;

    return () => {
      activeRef.current = false;
    };
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || !hasMore || error) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "640px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [error, hasMore, loadMore]);

  return (
    <>
      <PostList posts={posts} showSectionLabel />
      {hasMore ? (
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      ) : null}
      {loading || error ? (
        <div
          className={`caption ${styles.status}`}
          role="status"
          aria-live="polite"
        >
          {error ? (
            <button
              type="button"
              className={styles.retry}
              onClick={() => {
                loadMore();
              }}
            >
              글을 더 불러오지 못했습니다. 다시 시도
            </button>
          ) : (
            "글을 불러오는 중"
          )}
        </div>
      ) : null}
    </>
  );
}
