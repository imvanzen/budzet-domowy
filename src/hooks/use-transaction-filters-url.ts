"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DateValue } from "@internationalized/date";
import type { RangeValue } from "@react-types/shared";
import type { TransactionType } from "@/db/schema";
import {
  detectTransactionPeriodPreset,
  getCalendarRangeFromTransactionPreset,
  type TransactionPeriodPreset,
} from "@/lib/dateRange";
import {
  TRANSACTION_URL_PARAMS,
  getDefaultTransactionFiltersUrlState,
  parseTransactionFiltersFromSearchParams,
  type TransactionFiltersUrlState,
} from "@/lib/transaction-filters-url";
import { useUrlSearchParams } from "@/hooks/use-url-search-params";

const SEARCH_DEBOUNCE_MS = 300;

type UseTransactionFiltersUrlOptions = {
  categoryIds: string[];
};

type UseTransactionFiltersUrlResult = TransactionFiltersUrlState & {
  searchInput: string;
  debouncedSearchPhrase: string;
  setType: (type: TransactionType | "ALL") => void;
  setCategoryId: (categoryId: string | "ALL") => void;
  setDatePreset: (preset: TransactionPeriodPreset) => void;
  setDateRange: (range: RangeValue<DateValue>) => void;
  setDateFilter: (
    preset: TransactionPeriodPreset,
    range: RangeValue<DateValue>,
  ) => void;
  setSearchInput: (phrase: string) => void;
  setPage: (page: number) => void;
};

function formatDateParam(value: DateValue): string {
  const month = String(value.month).padStart(2, "0");
  const day = String(value.day).padStart(2, "0");
  return `${value.year}-${month}-${day}`;
}

function areRangesEqual(
  left: RangeValue<DateValue>,
  right: RangeValue<DateValue>,
): boolean {
  return (
    formatDateParam(left.start) === formatDateParam(right.start) &&
    formatDateParam(left.end) === formatDateParam(right.end)
  );
}

function updateDateFilterIfChanged(
  updateSearchParams: ReturnType<typeof useUrlSearchParams>["updateSearchParams"],
  current: Pick<TransactionFiltersUrlState, "datePreset" | "dateRange">,
  preset: TransactionPeriodPreset,
  range: RangeValue<DateValue>,
) {
  if (
    current.datePreset === preset &&
    areRangesEqual(current.dateRange, range)
  ) {
    return;
  }

  updateSearchParams({
    [TRANSACTION_URL_PARAMS.period]: preset,
    [TRANSACTION_URL_PARAMS.from]: formatDateParam(range.start),
    [TRANSACTION_URL_PARAMS.to]: formatDateParam(range.end),
    [TRANSACTION_URL_PARAMS.page]: null,
  });
}

function hasDateParams(searchParams: URLSearchParams): boolean {
  return (
    searchParams.has(TRANSACTION_URL_PARAMS.from) ||
    searchParams.has(TRANSACTION_URL_PARAMS.to) ||
    searchParams.has(TRANSACTION_URL_PARAMS.period)
  );
}

export function useTransactionFiltersUrl({
  categoryIds,
}: UseTransactionFiltersUrlOptions): UseTransactionFiltersUrlResult {
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  const defaultsApplied = useRef(false);

  const urlState = useMemo(
    () => parseTransactionFiltersFromSearchParams(searchParams, categoryIds),
    [searchParams, categoryIds.join(",")],
  );

  const [searchInput, setSearchInput] = useState(urlState.searchPhrase);

  useEffect(() => {
    if (defaultsApplied.current || hasDateParams(searchParams)) {
      return;
    }

    defaultsApplied.current = true;
    const defaults = getDefaultTransactionFiltersUrlState();

    updateSearchParams({
      [TRANSACTION_URL_PARAMS.period]: defaults.datePreset,
      [TRANSACTION_URL_PARAMS.from]: formatDateParam(defaults.dateRange.start),
      [TRANSACTION_URL_PARAMS.to]: formatDateParam(defaults.dateRange.end),
    });
  }, [searchParams, updateSearchParams]);

  useEffect(() => {
    setSearchInput(urlState.searchPhrase);
  }, [urlState.searchPhrase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedInput = searchInput.trim();
      const trimmedUrl = urlState.searchPhrase.trim();

      if (trimmedInput === trimmedUrl) {
        return;
      }

      updateSearchParams({
        [TRANSACTION_URL_PARAMS.query]: trimmedInput || null,
        [TRANSACTION_URL_PARAMS.page]: null,
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput, updateSearchParams, urlState.searchPhrase]);

  const updateDateFilter = useCallback(
    (
      preset: TransactionPeriodPreset,
      range: RangeValue<DateValue>,
    ) => {
      updateDateFilterIfChanged(
        updateSearchParams,
        urlState,
        preset,
        range,
      );
    },
    [updateSearchParams, urlState],
  );

  const setType = useCallback(
    (type: TransactionType | "ALL") => {
      updateSearchParams({
        [TRANSACTION_URL_PARAMS.type]: type === "ALL" ? null : type,
        [TRANSACTION_URL_PARAMS.page]: null,
      });
    },
    [updateSearchParams],
  );

  const setCategoryId = useCallback(
    (categoryId: string | "ALL") => {
      updateSearchParams({
        [TRANSACTION_URL_PARAMS.category]:
          categoryId === "ALL" ? null : categoryId,
        [TRANSACTION_URL_PARAMS.page]: null,
      });
    },
    [updateSearchParams],
  );

  const setDateFilter = useCallback(
    (
      preset: TransactionPeriodPreset,
      range: RangeValue<DateValue>,
    ) => {
      updateDateFilter(preset, range);
    },
    [updateDateFilter],
  );

  const setDatePreset = useCallback(
    (preset: TransactionPeriodPreset) => {
      const range = getCalendarRangeFromTransactionPreset(
        preset,
        preset === "custom" ? urlState.dateRange : null,
      );
      updateDateFilter(preset, range);
    },
    [updateDateFilter, urlState.dateRange],
  );

  const setDateRange = useCallback(
    (range: RangeValue<DateValue>) => {
      updateDateFilter(detectTransactionPeriodPreset(range), range);
    },
    [updateDateFilter],
  );

  const setPage = useCallback(
    (page: number) => {
      updateSearchParams({
        [TRANSACTION_URL_PARAMS.page]: page > 1 ? page : null,
      });
    },
    [updateSearchParams],
  );

  return {
    ...urlState,
    searchInput,
    debouncedSearchPhrase: urlState.searchPhrase,
    setType,
    setCategoryId,
    setDatePreset,
    setDateRange,
    setDateFilter,
    setSearchInput,
    setPage,
  };
}
