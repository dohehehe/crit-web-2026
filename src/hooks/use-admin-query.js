"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { ADMIN_SCOPE } from "@/lib/api/constants";

export function useAdminQuery(path, { params, ...options } = {}) {
  return useApiQuery(path, {
    ...options,
    params: {
      ...params,
      scope: ADMIN_SCOPE,
    },
  });
}
