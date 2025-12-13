import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { TransactionForm } from "../TransactionForm";
import { useTestDb } from "@/__tests__/db/helpers";
import { seedTestDb } from "@/__tests__/db/fixtures";
import type { Category } from "@/db/schema";

// Mock the server action
vi.mock("@/app/transactions/actions", () => ({
  addTransaction: vi.fn(),
}));

import { addTransaction } from "@/app/transactions/actions";

describe("TransactionForm", () => {
  const testDb = useTestDb();
  let categories: Category[] = [];

  beforeEach(async () => {
    await seedTestDb(testDb.db);
    // Get categories from test db
    const allCategories = await testDb.db.query.categories.findMany();
    categories = allCategories;
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render all form fields", () => {
      render(<TransactionForm categories={categories} />);

      expect(screen.getByLabelText("Kwota")).toBeInTheDocument();
      expect(screen.getByLabelText("Typ")).toBeInTheDocument();
      expect(screen.getByLabelText("Data")).toBeInTheDocument();
      expect(screen.getByLabelText("Kategoria")).toBeInTheDocument();
      expect(screen.getByLabelText("Opis")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /dodaj transakcję/i })
      ).toBeInTheDocument();
    });

    it("should render category options", () => {
      render(<TransactionForm categories={categories} />);

      const categorySelect = screen.getByLabelText("Kategoria");
      expect(categorySelect).toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("should show error for amount <= 0", async () => {
      const user = userEvent.setup();
      render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const typeSelect = screen.getByLabelText("Typ");
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      await user.type(amountInput, "0");
      await user.click(typeSelect);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Kwota musi być większa od 0")
        ).toBeInTheDocument();
      });
    });

    it("should show error for negative amount", async () => {
      const user = userEvent.setup();
      render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const typeSelect = screen.getByLabelText("Typ");
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      await user.type(amountInput, "-10");
      await user.click(typeSelect);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Kwota musi być większa od 0")
        ).toBeInTheDocument();
      });
    });

    it("should show error for future date", async () => {
      const user = userEvent.setup();
      render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const dateInput = screen.getByLabelText("Data");
      const typeSelect = screen.getByLabelText("Typ");
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split("T")[0];

      await user.type(amountInput, "100");
      await user.clear(dateInput);
      await user.type(dateInput, futureDateString);
      await user.click(typeSelect);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Data nie może być z przyszłości")
        ).toBeInTheDocument();
      });
    });

    it("should show error for missing transaction type", async () => {
      const user = userEvent.setup();
      render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      await user.type(amountInput, "100");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Wybierz typ transakcji")).toBeInTheDocument();
      });
    });

    it("should show error for description > 500 characters", async () => {
      const user = userEvent.setup();
      render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const descriptionInput = screen.getByLabelText("Opis");
      const typeSelect = screen.getByLabelText("Typ");
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      const longDescription = "a".repeat(501);

      await user.type(amountInput, "100");
      await user.type(descriptionInput, longDescription);
      await user.click(typeSelect);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Opis nie może przekraczać 500 znaków")
        ).toBeInTheDocument();
      });
    });
  });

  describe("form submission", () => {
    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      vi.mocked(addTransaction).mockResolvedValue({
        success: true,
        data: { id: "test-id" },
      });

      render(<TransactionForm categories={categories} onSuccess={mockOnSuccess} />);

      const amountInput = screen.getByLabelText("Kwota");
      const typeSelect = screen.getByLabelText("Typ");
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      await user.type(amountInput, "100.50");
      await user.click(typeSelect);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(submitButton);

      await waitFor(() => {
        expect(addTransaction).toHaveBeenCalledWith({
          amount: 100.5,
          type: "INCOME",
          date: expect.any(Date),
          categoryId: expect.any(String).or(null),
          description: expect.any(String).or(null),
        });
      });

      await waitFor(() => {
        expect(
          screen.getByText("Transakcja została dodana pomyślnie!")
        ).toBeInTheDocument();
      });
    });

    it("should show error message on server error", async () => {
      const user = userEvent.setup();

      vi.mocked(addTransaction).mockResolvedValue({
        success: false,
        error: "Server error occurred",
      });

      render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const typeSelect = screen.getByLabelText("Typ");
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      await user.type(amountInput, "100");
      await user.click(typeSelect);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Server error occurred")).toBeInTheDocument();
      });
    });

    it("should reset form after successful submission", async () => {
      const user = userEvent.setup();

      vi.mocked(addTransaction).mockResolvedValue({
        success: true,
        data: { id: "test-id" },
      });

      render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota") as HTMLInputElement;
      const typeSelect = screen.getByLabelText("Typ");
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      await user.type(amountInput, "100");
      await user.click(typeSelect);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(submitButton);

      await waitFor(() => {
        expect(amountInput.value).toBe("");
      });
    });
  });
});


