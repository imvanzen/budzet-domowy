import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { CategoryList } from "../CategoryList";
import { removeCategory } from "@/app/categories/actions";
import type { Category } from "@/db/schema";

// Mock the server actions
vi.mock("@/app/categories/actions", () => ({
  removeCategory: vi.fn(),
}));

describe("CategoryList", () => {
  const mockCategories: Category[] = [
    {
      id: "cat-1",
      name: "Food",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "cat-2",
      name: "Transport",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render empty state when no categories", () => {
      render(<CategoryList categories={[]} />);

      expect(screen.getByText("Brak kategorii")).toBeInTheDocument();
    });

    it("should render list of categories", () => {
      render(<CategoryList categories={mockCategories} />);

      expect(screen.getByText("Food")).toBeInTheDocument();
      expect(screen.getByText("Transport")).toBeInTheDocument();
    });

    it("should render edit and delete buttons for each category", () => {
      const onEdit = vi.fn();
      render(<CategoryList categories={mockCategories} onEdit={onEdit} />);

      const editButtons = screen.getAllByRole("button", { name: /edytuj/i });
      const deleteButtons = screen.getAllByRole("button", { name: /usuń/i });

      expect(editButtons.length).toBe(2);
      expect(deleteButtons.length).toBe(2);
    });
  });

  describe("interactions", () => {
    it("should call onEdit when edit button is clicked", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(<CategoryList categories={mockCategories} onEdit={onEdit} />);

      const editButtons = screen.getAllByRole("button", { name: /edytuj/i });
      await user.click(editButtons[0]!);

      expect(onEdit).toHaveBeenCalledWith(mockCategories[0]);
    });

    it("should show confirmation modal when delete button is clicked", async () => {
      const user = userEvent.setup();

      render(<CategoryList categories={mockCategories} />);

      const deleteButtons = screen.getAllByRole("button", { name: /usuń/i });
      await user.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(
          screen.getByText(/Czy na pewno chcesz usunąć tę kategorię\?/)
        ).toBeInTheDocument();
      });
    });

    it("should delete category when confirmed", async () => {
      const user = userEvent.setup();

      vi.mocked(removeCategory).mockResolvedValue({
        success: true,
      });

      render(<CategoryList categories={mockCategories} />);

      const deleteButtons = screen.getAllByRole("button", { name: /usuń/i });
      await user.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(
          screen.getByText(/Czy na pewno chcesz usunąć tę kategorię\?/)
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", { name: /usuń/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(removeCategory).toHaveBeenCalledWith("cat-1");
      });
    });

    it("should close modal when cancel is clicked", async () => {
      const user = userEvent.setup();

      render(<CategoryList categories={mockCategories} />);

      const deleteButtons = screen.getAllByRole("button", { name: /usuń/i });
      await user.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(
          screen.getByText(/Czy na pewno chcesz usunąć tę kategorię\?/)
        ).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /anuluj/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Czy na pewno chcesz usunąć tę kategorię?")
        ).not.toBeInTheDocument();
      });
    });
  });
});

