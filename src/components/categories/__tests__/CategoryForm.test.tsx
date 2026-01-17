import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { CategoryForm } from "../CategoryForm";
import { addCategory, editCategory } from "@/app/categories/actions";

// Mock the server actions
vi.mock("@/app/categories/actions", () => ({
  addCategory: vi.fn(),
  editCategory: vi.fn(),
}));

describe("CategoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render all form fields in add mode", () => {
      render(<CategoryForm />);

      expect(screen.getByLabelText("Nazwa")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /dodaj kategorię/i })
      ).toBeInTheDocument();
    });

    it("should render form in edit mode with pre-filled data", () => {
      const category = {
        id: "cat-1",
        name: "Test Category",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<CategoryForm category={category} />);

      const nameInput = screen.getByLabelText("Nazwa") as HTMLInputElement;
      expect(nameInput.value).toBe("Test Category");
      expect(
        screen.getByRole("button", { name: /zapisz/i })
      ).toBeInTheDocument();
    });

    it("should show cancel button in edit mode", () => {
      const category = {
        id: "cat-1",
        name: "Test Category",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const onCancel = vi.fn();
      render(<CategoryForm category={category} onCancel={onCancel} />);

      expect(
        screen.getByRole("button", { name: /anuluj/i })
      ).toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("should show error for empty name", async () => {
      const user = userEvent.setup();
      const { container } = render(<CategoryForm />);

      const nameInput = screen.getByLabelText("Nazwa");
      const form = container.querySelector("form");

      // Ensure input is empty and submit
      await user.clear(nameInput);
      // Wait a bit for the clear to take effect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByText("Nazwa kategorii jest wymagana")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("should show error for whitespace-only name", async () => {
      const user = userEvent.setup();
      render(<CategoryForm />);

      const nameInput = screen.getByLabelText("Nazwa");
      const submitButton = screen.getByRole("button", {
        name: /dodaj kategorię/i,
      });

      await user.type(nameInput, "   ");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Nazwa kategorii jest wymagana")
        ).toBeInTheDocument();
      });
    });

    it("should show error for name longer than 100 characters", async () => {
      const user = userEvent.setup();
      const { container } = render(<CategoryForm />);

      const nameInput = screen.getByLabelText("Nazwa");
      const form = container.querySelector("form");

      const longName = "a".repeat(101);
      // Clear and type the long name
      await user.clear(nameInput);
      await user.type(nameInput, longName);
      
      if (form) {
        fireEvent.submit(form);
      }

      // Client-side validation should catch this before calling server action
      await waitFor(() => {
        expect(screen.getByText("Nazwa nie może przekraczać 100 znaków")).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify server action was not called
      expect(addCategory).not.toHaveBeenCalled();
    });
  });

  describe("form submission", () => {
    it("should submit form with valid data in add mode", async () => {
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      vi.mocked(addCategory).mockResolvedValue({
        success: true,
        data: { id: "test-id" },
      });

      render(<CategoryForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText("Nazwa");
      const submitButton = screen.getByRole("button", {
        name: /dodaj kategorię/i,
      });

      await user.type(nameInput, "New Category");
      await user.click(submitButton);

      await waitFor(() => {
        expect(addCategory).toHaveBeenCalledWith({
          name: "New Category",
        });
      });

      await waitFor(() => {
        expect(
          screen.getByText("Kategoria została dodana pomyślnie!")
        ).toBeInTheDocument();
      });
    });

    it("should submit form with valid data in edit mode", async () => {
      const user = userEvent.setup();
      const category = {
        id: "cat-1",
        name: "Original Name",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(editCategory).mockResolvedValue({
        success: true,
      });

      render(<CategoryForm category={category} />);

      const nameInput = screen.getByLabelText("Nazwa");
      const submitButton = screen.getByRole("button", { name: /zapisz/i });

      await user.clear(nameInput);
      await user.type(nameInput, "Updated Name");
      await user.click(submitButton);

      await waitFor(() => {
        expect(editCategory).toHaveBeenCalledWith("cat-1", {
          name: "Updated Name",
        });
      });

      await waitFor(() => {
        expect(
          screen.getByText("Kategoria została zaktualizowana!")
        ).toBeInTheDocument();
      });
    });

    it("should show error message on server error", async () => {
      const user = userEvent.setup();

      vi.mocked(addCategory).mockResolvedValue({
        success: false,
        error: "Server error occurred",
      });

      render(<CategoryForm />);

      const nameInput = screen.getByLabelText("Nazwa");
      const submitButton = screen.getByRole("button", {
        name: /dodaj kategorię/i,
      });

      await user.type(nameInput, "Test Category");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Server error occurred")).toBeInTheDocument();
      });
    });

    it("should reset form after successful submission in add mode", async () => {
      const user = userEvent.setup();

      vi.mocked(addCategory).mockResolvedValue({
        success: true,
        data: { id: "test-id" },
      });

      render(<CategoryForm />);

      const nameInput = screen.getByLabelText("Nazwa") as HTMLInputElement;
      const submitButton = screen.getByRole("button", {
        name: /dodaj kategorię/i,
      });

      await user.type(nameInput, "Test Category");
      await user.click(submitButton);

      await waitFor(() => {
        expect(nameInput.value).toBe("");
      });
    });

    it("should call onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const category = {
        id: "cat-1",
        name: "Test Category",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<CategoryForm category={category} onCancel={onCancel} />);

      const cancelButton = screen.getByRole("button", { name: /anuluj/i });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it("should call onSuccess after successful submission", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();

      vi.mocked(addCategory).mockResolvedValue({
        success: true,
        data: { id: "test-id" },
      });

      render(<CategoryForm onSuccess={onSuccess} />);

      const nameInput = screen.getByLabelText("Nazwa");
      const submitButton = screen.getByRole("button", {
        name: /dodaj kategorię/i,
      });

      await user.type(nameInput, "Test Category");
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });
});

