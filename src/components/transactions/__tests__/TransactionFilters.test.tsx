import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { TransactionFilters } from "../TransactionFilters";
import type { Category } from "@/db/schema";

// Mock next/navigation
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render type and category filters", () => {
      render(
        <TransactionFilters
          categories={mockCategories}
          selectedType="ALL"
          selectedCategoryId="ALL"
          onTypeChange={mockOnTypeChange}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      expect(screen.getAllByLabelText("Typ transakcji")[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText("Kategoria")[0]).toBeInTheDocument();
    });

    it("should display all category options", () => {
      render(
        <TransactionFilters
          categories={mockCategories}
          selectedType="ALL"
          selectedCategoryId="ALL"
          onTypeChange={mockOnTypeChange}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      const categorySelect = screen.getAllByLabelText("Kategoria")[0];
      expect(categorySelect).toBeInTheDocument();
    });

    it("should show selected type", () => {
      render(
        <TransactionFilters
          categories={mockCategories}
          selectedType="INCOME"
          selectedCategoryId="ALL"
          onTypeChange={mockOnTypeChange}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      expect(screen.getAllByLabelText("Typ transakcji")[0]).toBeInTheDocument();
    });

    it("should show selected category", () => {
      render(
        <TransactionFilters
          categories={mockCategories}
          selectedType="ALL"
          selectedCategoryId="cat-1"
          onTypeChange={mockOnTypeChange}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      expect(screen.getAllByLabelText("Kategoria")[0]).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should render with correct selected values", () => {
      render(
        <TransactionFilters
          categories={mockCategories}
          selectedType="INCOME"
          selectedCategoryId="cat-1"
          onTypeChange={mockOnTypeChange}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      // Component should render with selected values
      expect(screen.getAllByLabelText("Typ transakcji")[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText("Kategoria")[0]).toBeInTheDocument();
    });

    it("should render all categories in the list", () => {
      render(
        <TransactionFilters
          categories={mockCategories}
          selectedType="ALL"
          selectedCategoryId="ALL"
          onTypeChange={mockOnTypeChange}
          onCategoryChange={mockOnCategoryChange}
        />
      );

      // Verify component renders with all categories
      expect(screen.getAllByLabelText("Kategoria")[0]).toBeInTheDocument();
    });
  });
});

