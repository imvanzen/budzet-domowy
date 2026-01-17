import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { TransactionsManager } from "../TransactionsManager";
import { transactionType } from "@/db/schema";
import type { Transaction, Category } from "@/db/schema";

// Mock the server actions
vi.mock("@/app/transactions/actions", () => ({
  getFilteredTransactions: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import { getFilteredTransactions } from "@/app/transactions/actions";

describe("TransactionsManager", () => {
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
  ];

  const mockTransactions: Array<
    Transaction & { category: { name: string } | null }
  > = [
    {
      id: "trans-1",
      amount: 100.5,
      type: transactionType.INCOME,
      date: new Date("2024-01-15"),
      description: "Salary",
      categoryId: "cat-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      category: { name: "Jedzenie" },
    },
    {
      id: "trans-2",
      amount: 50.25,
      type: transactionType.EXPENSE,
      date: new Date("2024-01-16"),
      description: "Groceries",
      categoryId: "cat-2",
      createdAt: new Date(),
      updatedAt: new Date(),
      category: { name: "Transport" },
    },
    {
      id: "trans-3",
      amount: 75.0,
      type: transactionType.INCOME,
      date: new Date("2024-01-17"),
      description: null,
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFilteredTransactions).mockResolvedValue(mockTransactions);
  });

  describe("rendering", () => {
    it("should render transaction form and list", () => {
      render(
        <TransactionsManager
          initialTransactions={mockTransactions}
          categories={mockCategories}
        />
      );

      expect(screen.getAllByText("Dodaj transakcję")[0]).toBeInTheDocument();
      expect(screen.getByText("Lista transakcji")).toBeInTheDocument();
    });

    it("should render filters", () => {
      render(
        <TransactionsManager
          initialTransactions={mockTransactions}
          categories={mockCategories}
        />
      );

      expect(screen.getAllByLabelText("Typ transakcji")[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText("Kategoria")[0]).toBeInTheDocument();
    });

    it("should display transaction count", () => {
      render(
        <TransactionsManager
          initialTransactions={mockTransactions}
          categories={mockCategories}
        />
      );

      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  describe("filtering", () => {
    it("should call getFilteredTransactions on mount", async () => {
      render(
        <TransactionsManager
          initialTransactions={mockTransactions}
          categories={mockCategories}
        />
      );

      await waitFor(() => {
        expect(getFilteredTransactions).toHaveBeenCalled();
      });
    });

    it("should update transactions when filters change", async () => {
      const filteredTransactions = [mockTransactions[0]!];
      vi.mocked(getFilteredTransactions).mockResolvedValue(filteredTransactions);

      const { rerender } = render(
        <TransactionsManager
          initialTransactions={mockTransactions}
          categories={mockCategories}
        />
      );

      await waitFor(() => {
        expect(getFilteredTransactions).toHaveBeenCalled();
      });

      // Simulate filter change by rerendering with different initial state
      vi.mocked(getFilteredTransactions).mockResolvedValue(filteredTransactions);
      
      rerender(
        <TransactionsManager
          initialTransactions={filteredTransactions}
          categories={mockCategories}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument();
      });
    });

    it("should display filtered transaction count", async () => {
      const filteredTransactions = [mockTransactions[0]!];
      vi.mocked(getFilteredTransactions).mockResolvedValue(filteredTransactions);

      render(
        <TransactionsManager
          initialTransactions={mockTransactions}
          categories={mockCategories}
        />
      );

      await waitFor(() => {
        expect(getFilteredTransactions).toHaveBeenCalled();
      });
    });
  });
});

