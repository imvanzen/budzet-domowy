import { describe, it, expect } from "vitest";
import { parseDate } from "@internationalized/date";
import { transactionType } from "@/db/schema";
import {
  buildTransactionFiltersFromUrlState,
  getDefaultTransactionFiltersUrlState,
  parseTransactionFiltersFromSearchParams,
} from "../transaction-filters-url";

describe("parseTransactionFiltersFromSearchParams", () => {
  const categoryIds = ["cat-1", "cat-2"];

  it("should return current-year default range when search params are empty", () => {
    const now = new Date();
    const result = parseTransactionFiltersFromSearchParams(new URLSearchParams(), categoryIds);

    expect(result.selectedType).toBe("ALL");
    expect(result.selectedCategoryId).toBe("ALL");
    expect(result.searchPhrase).toBe("");
    expect(result.page).toBe(1);
    expect(result.datePreset).toBe("current-year");
    expect(result.dateRange.start).toEqual(parseDate(`${now.getFullYear()}-01-01`));
    expect(result.dateRange.end).toEqual(
      parseDate(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
      ),
    );
  });

  it("should parse all supported params", () => {
    const params = new URLSearchParams({
      type: transactionType.INCOME,
      category: "cat-2",
      period: "previous-month",
      from: "2026-05-01",
      to: "2026-05-31",
      q: "kino",
      page: "3",
    });

    const result = parseTransactionFiltersFromSearchParams(params, categoryIds);

    expect(result.selectedType).toBe(transactionType.INCOME);
    expect(result.selectedCategoryId).toBe("cat-2");
    expect(result.dateRange.start).toEqual(parseDate("2026-05-01"));
    expect(result.dateRange.end).toEqual(parseDate("2026-05-31"));
    expect(result.datePreset).toBe("previous-month");
    expect(result.searchPhrase).toBe("kino");
    expect(result.page).toBe(3);
  });

  it("should ignore invalid category id", () => {
    const params = new URLSearchParams({ category: "unknown" });
    const result = parseTransactionFiltersFromSearchParams(params, categoryIds);

    expect(result.selectedCategoryId).toBe("ALL");
  });

  it("should fall back to preset when date range is invalid", () => {
    const now = new Date();
    const params = new URLSearchParams({
      period: "current-year",
      from: "2024-06-30",
      to: "2024-06-01",
    });
    const result = parseTransactionFiltersFromSearchParams(params, categoryIds);

    expect(result.datePreset).toBe("current-year");
    expect(result.dateRange.start).toEqual(parseDate(`${now.getFullYear()}-01-01`));
  });
});

describe("buildTransactionFiltersFromUrlState", () => {
  it("should always include default date range filter", () => {
    const defaults = getDefaultTransactionFiltersUrlState();
    const result = buildTransactionFiltersFromUrlState({
      selectedType: "ALL",
      selectedCategoryId: "ALL",
      dateRange: defaults.dateRange,
      searchPhrase: "",
    });

    expect(result?.dateFrom).toBeInstanceOf(Date);
    expect(result?.dateTo).toBeInstanceOf(Date);
  });

  it("should build filters from url state", () => {
    const result = buildTransactionFiltersFromUrlState({
      selectedType: transactionType.EXPENSE,
      selectedCategoryId: "cat-1",
      dateRange: {
        start: parseDate("2024-03-01"),
        end: parseDate("2024-03-31"),
      },
      searchPhrase: "  kino  ",
    });

    expect(result).toMatchObject({
      type: transactionType.EXPENSE,
      categoryId: "cat-1",
      query: "kino",
    });
    expect(result?.dateFrom).toBeInstanceOf(Date);
    expect(result?.dateTo).toBeInstanceOf(Date);
  });
});
