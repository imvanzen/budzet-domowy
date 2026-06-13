import { describe, it, expect } from "vitest";
import { parseDate } from "@internationalized/date";
import {
  validateTransactionDateRange,
  calendarDateRangeToDates,
  getDateRangeFromPreset,
} from "../dateRange";

const REFERENCE_DATE = new Date(2026, 5, 13, 15, 30, 0);

describe("validateTransactionDateRange", () => {
  it("should return null for empty range", () => {
    expect(validateTransactionDateRange(null)).toBeNull();
    expect(
      validateTransactionDateRange({ start: parseDate("2024-01-01"), end: parseDate("2024-01-01") })
    ).toBeNull();
  });

  it("should reject future dates", () => {
    const futureStart = parseDate("2099-01-01");
    const futureEnd = parseDate("2099-01-31");

    expect(
      validateTransactionDateRange({ start: futureStart, end: futureEnd })
    ).toBe("Data nie może być z przyszłości");
  });

  it("should reject start date after end date", () => {
    expect(
      validateTransactionDateRange({
        start: parseDate("2024-06-15"),
        end: parseDate("2024-06-01"),
      })
    ).toBe("Data początkowa nie może być późniejsza niż data końcowa");
  });

  it("should accept valid range", () => {
    expect(
      validateTransactionDateRange({
        start: parseDate("2024-01-01"),
        end: parseDate("2024-01-31"),
      })
    ).toBeNull();
  });
});

describe("getDateRangeFromPreset", () => {
  it("should use month-to-date for current month and rolling presets", () => {
    const currentMonth = getDateRangeFromPreset(
      "current-month",
      undefined,
      undefined,
      REFERENCE_DATE,
    );
    const last3Months = getDateRangeFromPreset(
      "last-3-months",
      undefined,
      undefined,
      REFERENCE_DATE,
    );

    expect(currentMonth.dateFrom).toEqual(new Date(2026, 5, 1));
    expect(currentMonth.dateTo).toEqual(new Date(2026, 5, 13, 23, 59, 59, 999));

    expect(last3Months.dateFrom).toEqual(new Date(2026, 3, 1));
    expect(last3Months.dateTo).toEqual(new Date(2026, 5, 13, 23, 59, 59, 999));

    expect(currentMonth.dateTo.getTime()).toBe(last3Months.dateTo.getTime());
    expect(currentMonth.dateFrom.getTime()).toBeGreaterThan(
      last3Months.dateFrom.getTime(),
    );
  });

  it("should use full previous calendar month", () => {
    const { dateFrom, dateTo } = getDateRangeFromPreset(
      "previous-month",
      undefined,
      undefined,
      REFERENCE_DATE,
    );

    expect(dateFrom).toEqual(new Date(2026, 4, 1));
    expect(dateTo).toEqual(new Date(2026, 4, 31, 23, 59, 59, 999));
  });

  it("should normalize custom range to start and end of day", () => {
    const { dateFrom, dateTo } = getDateRangeFromPreset(
      "custom",
      "2026-04-10",
      "2026-04-15",
      REFERENCE_DATE,
    );

    expect(dateFrom).toEqual(new Date(2026, 3, 10));
    expect(dateTo).toEqual(new Date(2026, 3, 15, 23, 59, 59, 999));
  });
});

describe("calendarDateRangeToDates", () => {
  it("should convert range to start and end of day dates", () => {
    const { dateFrom, dateTo } = calendarDateRangeToDates({
      start: parseDate("2024-03-10"),
      end: parseDate("2024-03-15"),
    });

    expect(dateFrom.getFullYear()).toBe(2024);
    expect(dateFrom.getMonth()).toBe(2);
    expect(dateFrom.getDate()).toBe(10);
    expect(dateFrom.getHours()).toBe(0);

    expect(dateTo.getFullYear()).toBe(2024);
    expect(dateTo.getMonth()).toBe(2);
    expect(dateTo.getDate()).toBe(15);
    expect(dateTo.getHours()).toBe(23);
    expect(dateTo.getMinutes()).toBe(59);
  });
});
