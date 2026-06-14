import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { TransactionForm } from "../TransactionForm";
import { useTestDb } from "@/__tests__/db/helpers";
import { seedTestDb } from "@/__tests__/db/fixtures";
import type { Category } from "@/db/schema";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/lib/pending-transaction", () => ({
  setPendingTransaction: vi.fn(),
}));

import { setPendingTransaction } from "@/lib/pending-transaction";

describe("TransactionForm", () => {
  const testDb = useTestDb();
  let categories: Category[] = [];

  beforeEach(async () => {
    await seedTestDb(testDb.db);
    const allCategories = await testDb.db.query.categories.findMany();
    categories = allCategories;
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render all form fields", () => {
      render(<TransactionForm categories={categories} />);

      expect(screen.getByLabelText("Kwota")).toBeInTheDocument();
      expect(screen.getAllByLabelText("Typ").length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText("Data").length).toBeGreaterThan(0);
      expect(screen.getByText("Kategoria")).toBeInTheDocument();
      expect(screen.getByLabelText("Opis")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /dodaj transakcję/i })).toBeInTheDocument();
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

      await waitFor(() => {
        expect(screen.getByText("Kwota musi być większa od 0")).toBeInTheDocument();
      });
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

      await waitFor(() => {
        expect(screen.getByText("Kwota musi być większa od 0")).toBeInTheDocument();
      });
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

      await waitFor(() => {
        expect(screen.getByText("Wybierz typ transakcji")).toBeInTheDocument();
      });
    });
  });

  describe("form submission", () => {
    it("should redirect with pending transaction on valid submit", async () => {
      const user = userEvent.setup();

      render(<TransactionForm categories={categories} />);

      const amountInput = screen.getByLabelText("Kwota");
      const typeButton = screen.getByRole("button", { name: /wybierz typ/i });
      const submitButton = screen.getByRole("button", {
        name: /dodaj transakcję/i,
      });

      await user.type(amountInput, "100.50");
      await user.click(typeButton);

      const incomeOption = await screen.findByRole("option", {
        name: /przychód/i,
      });
      await user.click(incomeOption);
      await user.click(submitButton);

      await waitFor(() => {
        expect(setPendingTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: 100.5,
            type: "INCOME",
            date: expect.any(String),
          }),
        );
        expect(mockPush).toHaveBeenCalledWith("/transactions");
      });
    });
  });
});
