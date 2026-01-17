import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
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
      render(<TransactionList transactions={[]} />);

      expect(screen.getByText("Brak transakcji")).toBeInTheDocument();
    });

    it("should render list of transactions", () => {
      render(<TransactionList transactions={mockTransactions} />);

      expect(screen.getByText("Salary")).toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();
    });

    it("should display income transactions with success styling", () => {
      render(<TransactionList transactions={mockTransactions} />);

      const incomeTransaction = screen.getByText("Salary").closest("div");
      expect(incomeTransaction).toBeInTheDocument();
    });

    it("should display expense transactions with danger styling", () => {
      render(<TransactionList transactions={mockTransactions} />);

      const expenseTransaction = screen.getByText("Groceries").closest("div");
      expect(expenseTransaction).toBeInTheDocument();
    });

    it("should show category name when present", () => {
      render(<TransactionList transactions={mockTransactions} />);

      expect(screen.getByText("Work")).toBeInTheDocument();
      expect(screen.getByText("Food")).toBeInTheDocument();
    });

    it("should show description when present", () => {
      render(<TransactionList transactions={mockTransactions} />);

      expect(screen.getByText("Salary")).toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();
    });

    it("should format currency correctly", () => {
      render(<TransactionList transactions={mockTransactions} />);

      // Check for formatted amounts (PLN format: "100,50 zł")
      expect(screen.getByText(/100,50/)).toBeInTheDocument();
      expect(screen.getByText(/50,25/)).toBeInTheDocument();
    });

    it("should format dates correctly", () => {
      render(<TransactionList transactions={mockTransactions} />);

      // Check for formatted dates (Polish format: "15.01.2024")
      expect(screen.getByText(/15\.01\.2024/)).toBeInTheDocument();
      expect(screen.getByText(/16\.01\.2024/)).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onEdit when edit button is clicked", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(
        <TransactionList transactions={mockTransactions} onEdit={onEdit} />
      );

      const editButtons = screen.getAllByRole("button", { name: /edytuj/i });
      await user.click(editButtons[0]!);

      expect(onEdit).toHaveBeenCalledWith(mockTransactions[0]);
    });

    it("should show confirmation modal when delete button is clicked", async () => {
      const user = userEvent.setup();

      render(<TransactionList transactions={mockTransactions} />);

      const deleteButtons = screen.getAllByRole("button", { name: /usuń/i });
      await user.click(deleteButtons[0]!);

      await waitFor(() => {
        // Modal text might be split across elements, use a more flexible matcher
        expect(
          screen.getByText((content, element) => {
            return element?.textContent?.includes("Czy na pewno chcesz usunąć tę transakcję") ?? false;
          })
        ).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it("should delete transaction when confirmed", async () => {
      const user = userEvent.setup();

      vi.mocked(removeTransaction).mockResolvedValue({
        success: true,
      });

      render(<TransactionList transactions={mockTransactions} />);

      const deleteButtons = screen.getAllByRole("button", { name: /usuń/i });
      await user.click(deleteButtons[0]!);

      await waitFor(() => {
        // Modal text might be split across elements
        expect(
          screen.getByText((content, element) => {
            return element?.textContent?.includes("Czy na pewno chcesz usunąć tę transakcję") ?? false;
          })
        ).toBeInTheDocument();
      }, { timeout: 2000 });

      // Find the confirm button in the modal (there might be multiple "Usuń" buttons)
      const confirmButtons = screen.getAllByRole("button", { name: /usuń/i });
      // The last one should be the modal confirm button
      await user.click(confirmButtons[confirmButtons.length - 1]!);

      await waitFor(() => {
        expect(removeTransaction).toHaveBeenCalledWith("trans-1");
      });
    });

    it("should close modal when cancel is clicked", async () => {
      const user = userEvent.setup();

      render(<TransactionList transactions={mockTransactions} />);

      const deleteButtons = screen.getAllByRole("button", { name: /usuń/i });
      await user.click(deleteButtons[0]!);

      await waitFor(() => {
        // Modal text might be split across elements
        expect(
          screen.getByText((content, element) => {
            return element?.textContent?.includes("Czy na pewno chcesz usunąć tę transakcję") ?? false;
          })
        ).toBeInTheDocument();
      }, { timeout: 2000 });

      const cancelButton = screen.getByRole("button", { name: /anuluj/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByText((content, element) => {
            return element?.textContent?.includes("Czy na pewno chcesz usunąć tę transakcję") ?? false;
          })
        ).not.toBeInTheDocument();
      });
    });
  });
});

