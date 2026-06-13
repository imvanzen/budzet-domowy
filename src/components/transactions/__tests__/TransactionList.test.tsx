import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { TransactionList } from "../TransactionList";
import { removeTransaction } from "@/app/transactions/actions";
import { transactionType } from "@/db/schema";
import type { Transaction } from "@/db/schema";

// Mock the server actions
vi.mock("@/app/transactions/actions", () => ({
  removeTransaction: vi.fn(),
}));

describe("TransactionList", () => {
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
      category: { name: "Work" },
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
      category: { name: "Food" },
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
  });

  describe("rendering", () => {
    it("should render empty state when no transactions", () => {
      render(<TransactionList transactions={[]} currency="PLN" />);

      expect(screen.getByText("Brak transakcji")).toBeInTheDocument();
    });

    it("should render list of transactions", () => {
      render(<TransactionList transactions={mockTransactions} currency="PLN" />);

      expect(screen.getByText("Salary")).toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();
    });

    it("should display income transactions with success styling", () => {
      render(<TransactionList transactions={mockTransactions} currency="PLN" />);

      const incomeTransaction = screen.getByText("Salary").closest("div");
      expect(incomeTransaction).toBeInTheDocument();
    });

    it("should display expense transactions with danger styling", () => {
      render(<TransactionList transactions={mockTransactions} currency="PLN" />);

      const expenseTransaction = screen.getByText("Groceries").closest("div");
      expect(expenseTransaction).toBeInTheDocument();
    });

    it("should show category name when present", () => {
      render(<TransactionList transactions={mockTransactions} currency="PLN" />);

      expect(screen.getByText("Work")).toBeInTheDocument();
      expect(screen.getByText("Food")).toBeInTheDocument();
    });

    it("should show description when present", () => {
      render(<TransactionList transactions={mockTransactions} currency="PLN" />);

      expect(screen.getByText("Salary")).toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();
    });

    it("should format currency correctly", () => {
      render(<TransactionList transactions={mockTransactions} currency="PLN" />);

      // Check for formatted amounts (PLN format: "100,50 zł")
      expect(screen.getByText(/100,50/)).toBeInTheDocument();
      expect(screen.getByText(/50,25/)).toBeInTheDocument();
    });

    it("should format dates correctly", () => {
      render(<TransactionList transactions={mockTransactions} currency="PLN" />);

      // Check for formatted dates (Polish format: "15.01.2024")
      expect(screen.getByText(/15\.01\.2024/)).toBeInTheDocument();
      expect(screen.getByText(/16\.01\.2024/)).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should link to edit page when edit button is clicked", () => {
      render(
        <TransactionList transactions={mockTransactions} currency="PLN" />
      );

      const editLinks = screen.getAllByRole("link", { name: /edytuj/i });
      expect(editLinks[0]).toHaveAttribute("href", "/transactions/trans-1/edit");
    });
  });
});
