import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
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
      // Select components might have multiple labels, use getAllByLabelText
      expect(screen.getAllByLabelText("Typ").length).toBeGreaterThan(0);
      expect(screen.getByLabelText("Data")).toBeInTheDocument();
      expect(screen.getAllByLabelText("Kategoria").length).toBeGreaterThan(0);
      expect(screen.getByLabelText("Opis")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /dodaj transakcję/i })
      ).toBeInTheDocument();
    });

    it("should render category options", () => {
      render(<TransactionForm categories={categories} />);

      // Select component might have multiple "Kategoria" labels
      const categorySelects = screen.getAllByLabelText("Kategoria");
      expect(categorySelects.length).toBeGreaterThan(0);
    });
  });

  describe("form validation", () => {
    it("should show error for amount <= 0", async () => {
      const user = userEvent.setup();
      const { container } = render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const form = container.querySelector("form");

      await user.clear(amountInput);
      await user.type(amountInput, "0");

      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(
        () => {
          expect(
            screen.getByText("Kwota musi być większa od 0")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should show error for negative amount", async () => {
      const user = userEvent.setup();
      const { container } = render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const form = container.querySelector("form");

      await user.clear(amountInput);
      await user.type(amountInput, "-10");

      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(
        () => {
          expect(
            screen.getByText("Kwota musi być większa od 0")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should show error for future date", async () => {
      const user = userEvent.setup();
      const { container } = render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const dateInput = screen.getByLabelText("Data");
      const form = container.querySelector("form");

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split("T")[0];

      await user.clear(amountInput);
      await user.type(amountInput, "100");
      await user.clear(dateInput);
      await user.type(dateInput, futureDateString);

      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(
        () => {
          expect(
            screen.getByText("Data nie może być z przyszłości")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should show error for missing transaction type", async () => {
      const user = userEvent.setup();
      const { container } = render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const form = container.querySelector("form");

      await user.clear(amountInput);
      await user.type(amountInput, "100");

      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(
        () => {
          expect(
            screen.getByText("Wybierz typ transakcji")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should show error for description > 500 characters", async () => {
      const user = userEvent.setup();
      const { container } = render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const descriptionInput = screen.getByLabelText("Opis");
      const form = container.querySelector("form");

      const longDescription = "a".repeat(501);

      await user.clear(amountInput);
      await user.type(amountInput, "100");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, longDescription);

      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(
        () => {
          expect(
            screen.getByText("Opis nie może przekraczać 500 znaków")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
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

      render(
        <TransactionForm categories={categories} onSuccess={mockOnSuccess} />
      );

      const amountInput = screen.getByLabelText("Kwota");
      const typeSelects = screen.getAllByLabelText("Typ");
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      await user.type(amountInput, "100.50");
      await user.click(typeSelects[0]!);
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

      await waitFor(
        () => {
          expect(
            screen.getByText("Transakcja została dodana pomyślnie!")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should show error message on server error", async () => {
      const user = userEvent.setup();

      vi.mocked(addTransaction).mockResolvedValue({
        success: false,
        error: "Server error occurred",
      });

      render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const typeSelects = screen.getAllByLabelText("Typ");
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      await user.type(amountInput, "100");
      await user.click(typeSelects[0]!);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByText("Server error occurred")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("should reset form after successful submission", async () => {
      const user = userEvent.setup();

      vi.mocked(addTransaction).mockResolvedValue({
        success: true,
        data: { id: "test-id" },
      });

      render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota") as HTMLInputElement;
      const typeSelects = screen.getAllByLabelText("Typ");
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      await user.type(amountInput, "100");
      await user.click(typeSelects[0]!);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(amountInput.value).toBe("");
        },
        { timeout: 2000 }
      );
    });
  });
});
