import { describe, it, expect } from "vitest";
import { parseDate } from "@internationalized/date";
import {
  validateTransactionDateRange,
  calendarDateRangeToDates,
} from "../dateRange";

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
