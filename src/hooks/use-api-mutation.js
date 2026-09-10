"use client";

import { useCallback, useState } from "react";
import { apiFetch } from "@/lib/api/fetcher";

export function useApiMutation(method = "POST") {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (path, body) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFetch(path, { method, body });
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [method]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, data, error, isLoading, reset };
}
