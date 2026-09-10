"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/fetcher";
import { ADMIN_SCOPE } from "@/lib/api/constants";
import styles from "@/components/admin/shared/keyword/keyword-input.module.css";

function normalizeAuthor(author) {
  if (!author?.name?.trim()) {
    return null;
  }

  return {
    id: author.id ?? null,
    name: author.name.trim(),
  };
}

export function AuthorInput({ value = null, onChange, disabled = false }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const requestIdRef = useRef(0);
  const isComposingRef = useRef(false);
  const ignoreNextEnterRef = useRef(false);

  const setAuthor = useCallback(
    (author) => {
      const normalized = normalizeAuthor(author);
      onChange(normalized);
      setQuery("");
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [onChange]
  );

  const clearAuthor = useCallback(() => {
    onChange(null);
  }, [onChange]);

  function clearSuggestions() {
    setSuggestions([]);
    setIsSearching(false);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleQueryChange(nextQuery) {
    setQuery(nextQuery);
    if (!nextQuery.trim()) {
      clearSuggestions();
    }
  }

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return undefined;
    }

    const timer = setTimeout(async () => {
      const currentRequest = ++requestIdRef.current;
      setIsSearching(true);

      try {
        const result = await api.get("authors", {
          "ilike.name": trimmed,
          select: "id,name",
          order: "name.asc",
          limit: 10,
          scope: ADMIN_SCOPE,
        });

        if (currentRequest !== requestIdRef.current) {
          return;
        }

        const items = (result.items ?? [])
          .map(normalizeAuthor)
          .filter(Boolean)
          .filter(
            (item) =>
              item.name.toLowerCase() !== value?.name?.trim().toLowerCase()
          );

        setSuggestions(items);
        setIsOpen(items.length > 0);
        setActiveIndex(items.length > 0 ? 0 : -1);
      } catch {
        if (currentRequest === requestIdRef.current) {
          setSuggestions([]);
          setIsOpen(false);
          setActiveIndex(-1);
        }
      } finally {
        if (currentRequest === requestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmitQuery() {
    const trimmed = (inputRef.current?.value ?? query).trim();
    if (!trimmed) {
      return;
    }

    if (activeIndex >= 0 && suggestions[activeIndex]) {
      setAuthor(suggestions[activeIndex]);
      return;
    }

    setAuthor({ name: trimmed });
  }

  function isImeComposing(event) {
    return event.isComposing || event.nativeEvent.isComposing || isComposingRef.current;
  }

  function handleCompositionStart() {
    isComposingRef.current = true;
  }

  function handleCompositionEnd(event) {
    isComposingRef.current = false;
    ignoreNextEnterRef.current = true;
    handleQueryChange(event.target.value);
    window.setTimeout(() => {
      ignoreNextEnterRef.current = false;
    }, 0);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (isImeComposing(event) || ignoreNextEnterRef.current) {
        return;
      }

      handleSubmitQuery();
      return;
    }

    if (isImeComposing(event)) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen || suggestions.length === 0) {
        return;
      }
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen || suggestions.length === 0) {
        return;
      }
      setActiveIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
  }

  function handleEnterCapture(event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }

  const trimmedQuery = query.trim();
  let guideMain = null;
  let guideDetail = null;

  if (trimmedQuery && isSearching) {
    guideMain = "검색 중…";
  } else if (trimmedQuery && suggestions.length > 0) {
    guideMain = "검색 결과를 클릭해 등록하세요.";
  } else if (trimmedQuery) {
    guideMain = "새 작가는 Enter 두 번으로 등록";
    guideDetail = "(조합 확정 → 작가 추가)";
  }

  return (
    <div
      className={styles.wrapper}
      data-author-input
      onKeyDownCapture={handleEnterCapture}
    >
      {value && (
        <div className={styles.chips}>
          <span className={`${styles.chip} tag-keyword`}>
            {value.name}
            <button
              type="button"
              className={styles.chipRemove}
              onClick={clearAuthor}
              disabled={disabled}
              aria-label={`${value.name} 제거`}
            >
              ×
            </button>
          </span>
        </div>
      )}

      <div className={styles.searchWrap} ref={wrapperRef}>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="작가 검색..."
          disabled={disabled}
          autoComplete="off"
        />

        {isOpen && suggestions.length > 0 && (
          <ul className={styles.suggestions} role="listbox">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.id ?? suggestion.name}>
                <button
                  type="button"
                  className={`${styles.suggestion} ${index === activeIndex ? styles.suggestionActive : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => setAuthor(suggestion)}
                >
                  {suggestion.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {guideMain && (
        <p className={`${styles.guide} caption gray-65`}>
          {guideMain}
          {guideDetail && (
            <span className={styles.guideDetail}>{guideDetail}</span>
          )}
        </p>
      )}
    </div>
  );
}
