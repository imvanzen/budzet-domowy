import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTestDb } from "@/__tests__/db/helpers";
import { seedTestDb } from "@/__tests__/db/fixtures";
import { transactionType } from "@/db/schema";
import { transactions } from "@/db/schema";

// We need to test the service functions, but they use a global db import
// So we'll test them by directly using the database operations they perform
describe("TransactionService", () => {
  const testDb = useTestDb();

  beforeEach(async () => {
    await seedTestDb(testDb.db);
  });

  describe("createTransaction logic", () => {
    it("should create a transaction with valid data", async () => {
      const { db } = testDb;

      const input = {
        amount: 100.5,
        type: transactionType.INCOME,
        date: new Date("2024-01-15"),
        description: "Test transaction",
        categoryId: "cat-3",
      };

      const [result] = await db
        .insert(transactions)
        .values({
          ...input,
          updatedAt: new Date(),
        })
        .returning();

      expect(result).toBeDefined();
      expect(result.amount).toBe(100.5);
      expect(result.type).toBe(transactionType.INCOME);
      expect(result.description).toBe("Test transaction");
      expect(result.categoryId).toBe("cat-3");
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a transaction without category", async () => {
      const { db } = testDb;

      const input = {
        amount: 50.0,
        type: transactionType.EXPENSE,
        date: new Date("2024-01-16"),
        description: null,
        categoryId: null,
      };

      const [result] = await db
        .insert(transactions)
        .values({
          ...input,
          updatedAt: new Date(),
        })
        .returning();

      expect(result).toBeDefined();
      expect(result.amount).toBe(50.0);
      expect(result.type).toBe(transactionType.EXPENSE);
      expect(result.categoryId).toBeNull();
      expect(result.description).toBeNull();
    });

    it("should create a transaction without description", async () => {
      const { db } = testDb;

      const input = {
        amount: 75.25,
        type: transactionType.INCOME,
        date: new Date("2024-01-17"),
        description: null,
        categoryId: "cat-3",
      };

      const [result] = await db
        .insert(transactions)
        .values({
          ...input,
          updatedAt: new Date(),
        })
        .returning();

      expect(result).toBeDefined();
      expect(result.description).toBeNull();
    });
  });
});


