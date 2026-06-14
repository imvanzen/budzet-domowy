import { parseDate } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import type { RangeValue } from "@react-types/shared";
import type { TransactionType } from "@/db/schema";
import { transactionType } from "@/db/schema";
import type { TransactionFilters } from "@/services/transactions";
import {
  calendarDateRangeToDates,
  DEFAULT_TRANSACTION_PERIOD_PRESET,
  detectTransactionPeriodPreset,
  getCalendarRangeFromTransactionPreset,
  getDefaultTransactionDateRange,
  validateTransactionDateRange,
  type TransactionPeriodPreset,
} from "@/lib/dateRange";

export const TRANSACTION_URL_PARAMS = {
  type: "type",
  category: "category",
  from: "from",
  to: "to",
  period: "period",
  query: "q",
  page: "page",
} as const;

const TRANSACTION_PERIOD_VALUES = new Set<TransactionPeriodPreset>([
  "current-month",
  "previous-month",
  "current-year",
  "previous-year",
  "custom",
]);

export type TransactionFiltersUrlState = {
  selectedType: TransactionType | "ALL";
  selectedCategoryId: string | "ALL";
  datePreset: TransactionPeriodPreset;
  dateRange: RangeValue<DateValue>;
  searchPhrase: string;
  page: number;
};

const DATE_PARAM_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseType(value: string | null): TransactionType | "ALL" {
  if (value === transactionType.INCOME || value === transactionType.EXPENSE) {
    return value;
  }
  return "ALL";
}

function parseCategoryId(value: string | null, validCategoryIds: Set<string>): string | "ALL" {
  if (!value || !validCategoryIds.has(value)) {
    return "ALL";
  }
  return value;
}

function parsePeriod(value: string | null): TransactionPeriodPreset {
  if (value && TRANSACTION_PERIOD_VALUES.has(value as TransactionPeriodPreset)) {
    return value as TransactionPeriodPreset;
  }
  return DEFAULT_TRANSACTION_PERIOD_PRESET;
}

function parseDateRange(
  from: string | null,
  to: string | null,
  period: TransactionPeriodPreset,
): RangeValue<DateValue> {
  if (from && to && DATE_PARAM_PATTERN.test(from) && DATE_PARAM_PATTERN.test(to)) {
    try {
      const range = {
        start: parseDate(from),
        end: parseDate(to),
      };

      if (!validateTransactionDateRange(range)) {
        return range;
      }
    } catch {
      // fall through to preset-based default
    }
  }

  if (period === "custom" && from && to) {
    try {
      const range = {
        start: parseDate(from),
        end: parseDate(to),
      };

      if (!validateTransactionDateRange(range)) {
        return range;
      }
    } catch {
      // fall through
    }
  }

  return getCalendarRangeFromTransactionPreset(period);
}

export function parseTransactionFiltersFromSearchParams(
  searchParams: URLSearchParams,
  categoryIds: string[],
): TransactionFiltersUrlState {
  const validCategoryIds = new Set(categoryIds);
  const period = parsePeriod(searchParams.get(TRANSACTION_URL_PARAMS.period));
  const dateRange = parseDateRange(
    searchParams.get(TRANSACTION_URL_PARAMS.from),
    searchParams.get(TRANSACTION_URL_PARAMS.to),
    period,
  );

  return {
    selectedType: parseType(searchParams.get(TRANSACTION_URL_PARAMS.type)),
    selectedCategoryId: parseCategoryId(
      searchParams.get(TRANSACTION_URL_PARAMS.category),
      validCategoryIds,
    ),
    datePreset: detectTransactionPeriodPreset(dateRange),
    dateRange,
    searchPhrase: searchParams.get(TRANSACTION_URL_PARAMS.query) ?? "",
    page: parsePage(searchParams.get(TRANSACTION_URL_PARAMS.page)),
  };
}

export function buildTransactionFiltersFromUrlState(
  state: Pick<
    TransactionFiltersUrlState,
    "selectedType" | "selectedCategoryId" | "dateRange" | "searchPhrase"
  >,
): TransactionFilters | undefined {
  const filters: TransactionFilters = {};

  if (state.selectedType !== "ALL") {
    filters.type = state.selectedType;
  }

  if (state.selectedCategoryId !== "ALL") {
    filters.categoryId = state.selectedCategoryId;
  }

  if (
    state.dateRange?.start &&
    state.dateRange?.end &&
    !validateTransactionDateRange(state.dateRange)
  ) {
    const { dateFrom, dateTo } = calendarDateRangeToDates(state.dateRange);
    filters.dateFrom = dateFrom;
    filters.dateTo = dateTo;
  }

  const trimmedQuery = state.searchPhrase.trim();
  if (trimmedQuery) {
    filters.query = trimmedQuery;
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
}

export function getDefaultTransactionFiltersUrlState(): Pick<
  TransactionFiltersUrlState,
  "datePreset" | "dateRange"
> {
  const dateRange = getDefaultTransactionDateRange();

  return {
    datePreset: DEFAULT_TRANSACTION_PERIOD_PRESET,
    dateRange,
  };
}
