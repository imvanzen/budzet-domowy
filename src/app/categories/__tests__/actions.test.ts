import { describe, it, expect, vi, beforeEach } from "vitest";
import { addCategory, editCategory, removeCategory } from "../actions";
import * as categoriesService from "@/services/categories";

// Mock the categories service
vi.mock("@/services/categories", () => ({
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Categories Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addCategory", () => {
    it("should reject empty name", async () => {
      const result = await addCategory({ name: "" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Nazwa kategorii jest wymagana");
    });

    it("should reject whitespace-only name", async () => {
      const result = await addCategory({ name: "   " });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Nazwa kategorii jest wymagana");
    });

    it("should reject name longer than 100 characters", async () => {
      const longName = "a".repeat(101);
      const result = await addCategory({ name: longName });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Nazwa nie może przekraczać 100 znaków");
    });

    it("should accept name with exactly 100 characters", async () => {
      const name = "a".repeat(100);
      const mockCategory = {
        id: "test-id",
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(categoriesService.createCategory).mockResolvedValue(
        mockCategory as any
      );

      const result = await addCategory({ name });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.id).toBe("test-id");
      }
    });

    it("should create category with valid name", async () => {
      const mockCategory = {
        id: "test-id",
        name: "Test Category",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(categoriesService.createCategory).mockResolvedValue(
        mockCategory as any
      );

      const result = await addCategory({ name: "Test Category" });

      expect(result.success).toBe(true);
      expect(categoriesService.createCategory).toHaveBeenCalledWith({
        name: "Test Category",
      });
    });

    it("should handle database errors gracefully", async () => {
      vi.mocked(categoriesService.createCategory).mockRejectedValue(
        new Error("Database error")
      );

      const result = await addCategory({ name: "Test Category" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Wystąpił błąd podczas dodawania kategorii");
    });
  });

  describe("editCategory", () => {
    it("should reject empty name", async () => {
      const result = await editCategory("test-id", { name: "" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Nazwa kategorii jest wymagana");
    });

    it("should reject name longer than 100 characters", async () => {
      const longName = "a".repeat(101);
      const result = await editCategory("test-id", { name: longName });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Nazwa nie może przekraczać 100 znaków");
    });

    it("should update category with valid name", async () => {
      const mockCategory = {
        id: "test-id",
        name: "Updated Name",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(categoriesService.updateCategory).mockResolvedValue(
        mockCategory as any
      );

      const result = await editCategory("test-id", { name: "Updated Name" });

      expect(result.success).toBe(true);
      expect(categoriesService.updateCategory).toHaveBeenCalledWith("test-id", {
        name: "Updated Name",
      });
    });

    it("should allow partial updates", async () => {
      const mockCategory = {
        id: "test-id",
        name: "Original Name",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(categoriesService.updateCategory).mockResolvedValue(
        mockCategory as any
      );

      const result = await editCategory("test-id", {});

      expect(result.success).toBe(true);
    });

    it("should handle database errors gracefully", async () => {
      vi.mocked(categoriesService.updateCategory).mockRejectedValue(
        new Error("Database error")
      );

      const result = await editCategory("test-id", { name: "Updated Name" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Wystąpił błąd podczas edycji kategorii");
    });
  });

  describe("removeCategory", () => {
    it("should delete category successfully", async () => {
      vi.mocked(categoriesService.deleteCategory).mockResolvedValue();

      const result = await removeCategory("test-id");

      expect(result.success).toBe(true);
      expect(categoriesService.deleteCategory).toHaveBeenCalledWith("test-id");
    });

    it("should handle database errors gracefully", async () => {
      vi.mocked(categoriesService.deleteCategory).mockRejectedValue(
        new Error("Database error")
      );

      const result = await removeCategory("test-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Wystąpił błąd podczas usuwania kategorii");
    });
  });
});

