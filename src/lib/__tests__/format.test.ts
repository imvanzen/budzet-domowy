import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, formatDateInput } from "../format";

describe("formatCurrency", () => {
  it("should format PLN currency correctly", () => {
    // Note: Intl.NumberFormat uses non-breaking spaces (U+00A0) instead of regular spaces
    expect(formatCurrency(100.5, "PLN")).toMatch(/100,50\s+zł/);
    expect(formatCurrency(1000, "PLN")).toMatch(/1000,00\s+zł/);
    expect(formatCurrency(0.99, "PLN")).toMatch(/0,99\s+zł/);
  });

  it("should format EUR currency correctly", () => {
    expect(formatCurrency(100.5, "EUR")).toMatch(/100,50\s+€/);
    expect(formatCurrency(1000, "EUR")).toMatch(/1000,00\s+€/);
  });

  it("should format USD currency correctly", () => {
    // Using Polish locale, USD is formatted as "100,50 USD"
    expect(formatCurrency(100.5, "USD")).toMatch(/100,50\s+USD/);
    expect(formatCurrency(1000, "USD")).toMatch(/1000,00\s+USD/);
  });

  it("should default to PLN when currency is not provided", () => {
    expect(formatCurrency(100.5)).toMatch(/100,50\s+zł/);
  });

  it("should handle zero amount", () => {
    expect(formatCurrency(0, "PLN")).toMatch(/0,00\s+zł/);
  });

  it("should handle large amounts", () => {
    // Polish locale uses non-breaking spaces for thousands
    const result = formatCurrency(1234567.89, "PLN");
    expect(result).toContain("1");
    expect(result).toContain("234");
    expect(result).toContain("567,89");
    expect(result).toContain("zł");
  });

  it("should handle negative amounts", () => {
    expect(formatCurrency(-100.5, "PLN")).toMatch(/-100,50\s+zł/);
  });
});

describe("formatDate", () => {
  it("should format date in Polish format", () => {
    const date = new Date("2024-01-15");
    expect(formatDate(date)).toBe("15.01.2024");
  });

  it("should format date with single digit day and month", () => {
    const date = new Date("2024-01-05");
    expect(formatDate(date)).toBe("05.01.2024");
  });

  it("should format date at year boundary", () => {
    const date = new Date("2024-12-31");
    expect(formatDate(date)).toBe("31.12.2024");
  });
});

describe("formatDateInput", () => {
  it("should format date for input field", () => {
    const date = new Date("2024-01-15");
    expect(formatDateInput(date)).toBe("2024-01-15");
  });

  it("should format date with single digit month and day", () => {
    const date = new Date("2024-01-05");
    expect(formatDateInput(date)).toBe("2024-01-05");
  });

  it("should format date at year boundary", () => {
    const date = new Date("2024-12-31");
    expect(formatDateInput(date)).toBe("2024-12-31");
  });

  it("should handle leap year dates", () => {
    const date = new Date("2024-02-29");
    expect(formatDateInput(date)).toBe("2024-02-29");
  });
});
