"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type UrlSearchParamsUpdate = Record<string, string | number | null | undefined>;

type UpdateSearchParamsOptions = {
  resetKeys?: string[];
};

export function useUrlSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearchParams = useCallback(
    (updates: UrlSearchParamsUpdate, options?: UpdateSearchParamsOptions) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      for (const key of options?.resetKeys ?? []) {
        params.delete(key);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  return {
    searchParams,
    updateSearchParams,
  };
}
