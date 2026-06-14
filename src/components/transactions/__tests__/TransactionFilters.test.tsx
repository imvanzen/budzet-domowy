import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { parseDate } from "@internationalized/date";
import { TransactionFilters } from "../TransactionFilters";
import type { Category } from "@/db/schema";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("TransactionFilters", () => {
  const mockCategories: Category[] = [
    {
      id: "cat-1",
      name: "Jedzenie",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cat-2",
      name: "Transport",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cat-3",
      name: "Rozrywka",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockOnTypeChange = vi.fn();
  const mockOnCategoryChange = vi.fn();
  const mockOnDateFilterChange = vi.fn();
  const mockOnSearchChange = vi.fn();

  const defaultDateRange = {
    start: parseDate("2026-01-01"),
    end: parseDate("2026-06-13"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    categories: mockCategories,
    selectedType: "ALL" as const,
    selectedCategoryId: "ALL" as const,
    datePreset: "current-year" as const,
    dateRange: defaultDateRange,
    onTypeChange: mockOnTypeChange,
    onCategoryChange: mockOnCategoryChange,
    onDateFilterChange: mockOnDateFilterChange,
    onSearchChange: mockOnSearchChange,
  };

  describe("rendering", () => {
    it("should render search, type, category and date range filters", () => {
      render(<TransactionFilters {...defaultProps} />);

      expect(screen.getAllByLabelText("Szukaj")[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText("Typ transakcji")[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText("Kategoria")[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText("Zakres dat")[0]).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onSearchChange when typing in search field", async () => {
      const user = userEvent.setup();
      render(<TransactionFilters {...defaultProps} />);

      const searchInput = screen.getAllByLabelText("Szukaj")[0];
      await user.type(searchInput, "kino");

      expect(mockOnSearchChange).toHaveBeenCalled();
    });
  });
});
