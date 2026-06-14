import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@/__tests__/test-utils";
import { TransactionsManager } from "../TransactionsManager";
import { transactionType } from "@/db/schema";
import type { Category } from "@/db/schema";
import type { PaginatedResult, TransactionWithCategory } from "@/services/transactions";

vi.mock("@/app/transactions/actions", () => ({
  getFilteredTransactions: vi.fn(),
  addTransaction: vi.fn(),
}));

vi.mock("@/lib/pending-transaction", () => ({
  consumePendingTransaction: vi.fn(() => null),
}));

vi.mock("@/lib/sync-toast", () => ({
  showSyncToast: vi.fn((operation: () => Promise<unknown>) => operation()),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/transactions",
  useSearchParams: () => new URLSearchParams(),
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

  const mockTransactions: TransactionWithCategory[] = [
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

  const mockInitialData: PaginatedResult<TransactionWithCategory> = {
    items: mockTransactions,
    total: 3,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFilteredTransactions).mockResolvedValue(mockInitialData);
  });

  describe("rendering", () => {
    it("should render transaction list and add button", () => {
      render(
        <TransactionsManager
          initialData={mockInitialData}
          categories={mockCategories}
          currency="PLN"
        />
      );

      expect(screen.getByText("Lista transakcji")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /dodaj transakcję/i })
      ).toHaveAttribute("href", "/transactions/new");
    });

    it("should render filters", () => {
      render(
        <TransactionsManager
          initialData={mockInitialData}
          categories={mockCategories}
          currency="PLN"
        />
      );

      expect(screen.getAllByLabelText("Typ transakcji")[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText("Kategoria")[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText("Zakres dat")[0]).toBeInTheDocument();
      expect(screen.getAllByLabelText("Szukaj")[0]).toBeInTheDocument();
    });

    it("should display total transaction count", () => {
      render(
        <TransactionsManager
          initialData={mockInitialData}
          categories={mockCategories}
          currency="PLN"
        />
      );

      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  describe("filtering", () => {
    it("should call getFilteredTransactions on mount", async () => {
      render(
        <TransactionsManager
          initialData={mockInitialData}
          categories={mockCategories}
          currency="PLN"
        />
      );

      await waitFor(() => {
        expect(getFilteredTransactions).toHaveBeenCalled();
      });
    });

    it("should update transactions when filters change", async () => {
      const filteredData: PaginatedResult<TransactionWithCategory> = {
        items: [mockTransactions[0]!],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };
      vi.mocked(getFilteredTransactions).mockResolvedValue(filteredData);

      const { rerender } = render(
        <TransactionsManager
          initialData={mockInitialData}
          categories={mockCategories}
          currency="PLN"
        />
      );

      await waitFor(() => {
        expect(getFilteredTransactions).toHaveBeenCalled();
      });

      rerender(
        <TransactionsManager
          initialData={filteredData}
          categories={mockCategories}
          currency="PLN"
        />
      );

      await waitFor(() => {
        const header = screen.getByText("Lista transakcji").parentElement;
        expect(header).not.toBeNull();
        expect(within(header as HTMLElement).getByText("1")).toBeInTheDocument();
      });
    });
  });

  describe("pagination", () => {
    it("should render pagination when there are multiple pages", () => {
      const paginatedData: PaginatedResult<TransactionWithCategory> = {
        items: mockTransactions,
        total: 25,
        page: 1,
        pageSize: 10,
        totalPages: 3,
      };

      render(
        <TransactionsManager
          initialData={paginatedData}
          categories={mockCategories}
          currency="PLN"
        />
      );

      expect(
        screen.getByRole("navigation", { name: /paginacja transakcji/i })
      ).toBeInTheDocument();
    });

    it("should not render pagination for a single page", () => {
      render(
        <TransactionsManager
          initialData={mockInitialData}
          categories={mockCategories}
          currency="PLN"
        />
      );

      expect(
        screen.queryByRole("navigation", { name: /paginacja transakcji/i })
      ).not.toBeInTheDocument();
    });
  });
});
