import { describe, it, expect, vi, beforeEach } from "vitest";
import { addTransaction } from "../actions";
import { transactionType } from "@/db/schema";
import * as transactionsService from "@/services/transactions";

// Mock the transactions service
vi.mock("@/services/transactions", () => ({
  createTransaction: vi.fn(),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("addTransaction server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validation", () => {
    it("should reject transaction with amount <= 0", async () => {
      const result = await addTransaction({
        amount: 0,
        type: transactionType.INCOME,
        date: new Date(),
        categoryId: null,
        description: null,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Kwota musi być większa od 0");
    });

    it("should reject transaction with negative amount", async () => {
      const result = await addTransaction({
        amount: -10,
        type: transactionType.EXPENSE,
        date: new Date(),
        categoryId: null,
        description: null,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Kwota musi być większa od 0");
    });

    it("should reject transaction with future date", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const result = await addTransaction({
        amount: 100,
        type: transactionType.INCOME,
        date: futureDate,
        categoryId: null,
        description: null,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Data nie może być z przyszłości");
    });

    it("should reject transaction with description > 500 characters", async () => {
      const longDescription = "a".repeat(501);

      const result = await addTransaction({
        amount: 100,
        type: transactionType.INCOME,
        date: new Date(),
        categoryId: null,
        description: longDescription,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Opis nie może przekraczać 500 znaków");
    });

    it("should accept transaction with description = 500 characters", async () => {
      const description = "a".repeat(500);
      const mockTransaction = {
        id: "test-id",
        amount: 100,
        type: transactionType.INCOME,
        date: new Date(),
        description,
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(transactionsService.createTransaction).mockResolvedValue(
        mockTransaction as any
      );

      const result = await addTransaction({
        amount: 100,
        type: transactionType.INCOME,
        date: new Date(),
        categoryId: null,
        description,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("test-id");
      }
    });
  });

  describe("successful creation", () => {
    it("should create transaction with valid data", async () => {
      const mockTransaction = {
        id: "test-id-1",
        amount: 100.5,
        type: transactionType.INCOME,
        date: new Date("2024-01-15"),
        description: "Test transaction",
        categoryId: "cat-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(transactionsService.createTransaction).mockResolvedValue(
        mockTransaction as any
      );

      const result = await addTransaction({
        amount: 100.5,
        type: transactionType.INCOME,
        date: new Date("2024-01-15"),
        description: "Test transaction",
        categoryId: "cat-1",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("test-id-1");
      }
      expect(transactionsService.createTransaction).toHaveBeenCalledWith({
        amount: 100.5,
        type: transactionType.INCOME,
        date: new Date("2024-01-15"),
        description: "Test transaction",
        categoryId: "cat-1",
      });
    });

    it("should create transaction without optional fields", async () => {
      const mockTransaction = {
        id: "test-id-2",
        amount: 50.0,
        type: transactionType.EXPENSE,
        date: new Date("2024-01-16"),
        description: null,
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(transactionsService.createTransaction).mockResolvedValue(
        mockTransaction as any
      );

      const result = await addTransaction({
        amount: 50.0,
        type: transactionType.EXPENSE,
        date: new Date("2024-01-16"),
        categoryId: null,
        description: null,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("test-id-2");
      }
    });

    it("should accept transaction with today's date", async () => {
      const today = new Date();
      const mockTransaction = {
        id: "test-id-3",
        amount: 75.25,
        type: transactionType.INCOME,
        date: today,
        description: null,
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(transactionsService.createTransaction).mockResolvedValue(
        mockTransaction as any
      );

      const result = await addTransaction({
        amount: 75.25,
        type: transactionType.INCOME,
        date: today,
        categoryId: null,
        description: null,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should handle database errors gracefully", async () => {
      vi.mocked(transactionsService.createTransaction).mockRejectedValue(
        new Error("Database error")
      );

      const result = await addTransaction({
        amount: 100,
        type: transactionType.INCOME,
        date: new Date(),
        categoryId: null,
        description: null,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Wystąpił błąd podczas dodawania transakcji");
    });
  });
});


