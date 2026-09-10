"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api/fetcher";

export function useApiQuery(path, { params, enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(enabled));
  const paramsKey = JSON.stringify(params ?? {});
  const requestId = useRef(0);

  const refetch = useCallback(async () => {
    if (!enabled || !path) return null;

    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiFetch(path, { params });
      if (currentRequest === requestId.current) {
        setData(result);
      }
      return result;
    } catch (err) {
      if (currentRequest === requestId.current) {
        setError(err);
        setData(null);
      }
      throw err;
    } finally {
      if (currentRequest === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, path, paramsKey]);

  useEffect(() => {
    if (!enabled || !path) {
      return undefined;
    }

    let cancelled = false;
    const currentRequest = ++requestId.current;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFetch(path, { params });
        if (!cancelled && currentRequest === requestId.current) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled && currentRequest === requestId.current) {
          setError(err);
          setData(null);
        }
      } finally {
        if (!cancelled && currentRequest === requestId.current) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [enabled, path, paramsKey]);

  return { data, error, isLoading, refetch };
}
