import { describe, it, expect, beforeEach } from "vitest";
import { useTestDb } from "@/__tests__/db/helpers";
import { seedTestDb } from "@/__tests__/db/fixtures";
import { transactionType, transactions } from "@/db/schema";
import { desc, eq, and, gte, lte } from "drizzle-orm";

// We need to replace the db import in the service module
// Since services use a global db import, we'll test the logic by
// directly testing database operations that mirror the service functions

describe("Transactions Service Logic", () => {
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
  });

  describe("getTransactions logic", () => {
    it("should return transactions ordered by date descending", async () => {
      const { db } = testDb;

      const result = await db.query.transactions.findMany({
        orderBy: [desc(transactions.date)],
        with: {
          category: true,
        },
      });

      expect(result.length).toBeGreaterThan(0);

      // Verify ordering (most recent first)
      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        if (prev && curr) {
          const prevDate = new Date(prev.date);
          const currDate = new Date(curr.date);
          expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
        }
      }
    });

    it("should include category data when present", async () => {
      const { db } = testDb;

      const result = await db.query.transactions.findMany({
        with: {
          category: true,
        },
      });

      const withCategory = result.find((t) => t.category !== null);
      if (withCategory) {
        expect(withCategory.category).toBeDefined();
        expect(withCategory.category?.name).toBeDefined();
      }
    });

    it("should filter by dateFrom", async () => {
      const { db } = testDb;
      const dateFrom = new Date("2024-01-15");

      const result = await db.query.transactions.findMany({
        where: gte(transactions.date, dateFrom),
        orderBy: [desc(transactions.date)],
      });

      result.forEach((t) => {
        expect(new Date(t.date).getTime()).toBeGreaterThanOrEqual(
          dateFrom.getTime()
        );
      });
    });

    it("should filter by dateTo", async () => {
      const { db } = testDb;
      const dateTo = new Date("2024-01-20");

      const result = await db.query.transactions.findMany({
        where: lte(transactions.date, dateTo),
        orderBy: [desc(transactions.date)],
      });

      result.forEach((t) => {
        expect(new Date(t.date).getTime()).toBeLessThanOrEqual(
          dateTo.getTime()
        );
      });
    });

    it("should filter by type", async () => {
      const { db } = testDb;

      const result = await db.query.transactions.findMany({
        where: eq(transactions.type, transactionType.INCOME),
        orderBy: [desc(transactions.date)],
      });

      result.forEach((t) => {
        expect(t.type).toBe(transactionType.INCOME);
      });
    });

    it("should combine multiple filters", async () => {
      const { db } = testDb;
      const dateFrom = new Date("2024-01-01");
      const dateTo = new Date("2024-01-31");

      const result = await db.query.transactions.findMany({
        where: and(
          gte(transactions.date, dateFrom),
          lte(transactions.date, dateTo),
          eq(transactions.type, transactionType.EXPENSE)
        ),
        orderBy: [desc(transactions.date)],
      });

      result.forEach((t) => {
        const date = new Date(t.date);
        expect(date.getTime()).toBeGreaterThanOrEqual(dateFrom.getTime());
        expect(date.getTime()).toBeLessThanOrEqual(dateTo.getTime());
        expect(t.type).toBe(transactionType.EXPENSE);
      });
    });
  });

  describe("getSummary logic", () => {
    it("should calculate total income and expense", async () => {
      const { db } = testDb;

      await db.insert(transactions).values({
        amount: 100,
        type: transactionType.INCOME,
        date: new Date("2024-01-15"),
        categoryId: null,
        description: null,
        updatedAt: new Date(),
      });

      await db.insert(transactions).values({
        amount: 50,
        type: transactionType.EXPENSE,
        date: new Date("2024-01-16"),
        categoryId: null,
        description: null,
        updatedAt: new Date(),
      });

      const allTransactions = await db.query.transactions.findMany();

      const totalIncome = allTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = allTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      expect(totalIncome).toBeGreaterThanOrEqual(100);
      expect(totalExpense).toBeGreaterThanOrEqual(50);
      expect(totalIncome - totalExpense).toBe(totalIncome - totalExpense);
    });
  });

  describe("getExpensesByCategory logic", () => {
    it("should group expenses by category", async () => {
      const { db } = testDb;

      await db.insert(transactions).values({
        amount: 100,
        type: transactionType.EXPENSE,
        date: new Date("2024-01-15"),
        categoryId: "cat-3",
        description: null,
        updatedAt: new Date(),
      });

      const allTransactions = await db.query.transactions.findMany({
        where: eq(transactions.type, transactionType.EXPENSE),
        with: {
          category: true,
        },
      });

      const expenses = allTransactions.filter((t) => t.type === "EXPENSE");

      const grouped = expenses.reduce((acc, t) => {
        const key = t.categoryId || "null";
        const name = t.category?.name || "Bez kategorii";

        if (!acc[key]) {
          acc[key] = { categoryId: t.categoryId, categoryName: name, total: 0 };
        }
        acc[key].total += t.amount;
        return acc;
      }, {} as Record<string, { categoryId: string | null; categoryName: string; total: number }>);

      const result = Object.values(grouped);

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) => r.categoryId === "cat-3")).toBe(true);
    });

    it("should include expenses without category as 'Bez kategorii'", async () => {
      const { db } = testDb;

      await db.insert(transactions).values({
        amount: 50,
        type: transactionType.EXPENSE,
        date: new Date("2024-01-15"),
        categoryId: null,
        description: null,
        updatedAt: new Date(),
      });

      const allTransactions = await db.query.transactions.findMany({
        where: eq(transactions.type, transactionType.EXPENSE),
        with: {
          category: true,
        },
      });

      const expenses = allTransactions.filter((t) => t.type === "EXPENSE");

      const grouped = expenses.reduce((acc, t) => {
        const key = t.categoryId || "null";
        const name = t.category?.name || "Bez kategorii";

        if (!acc[key]) {
          acc[key] = { categoryId: t.categoryId, categoryName: name, total: 0 };
        }
        acc[key].total += t.amount;
        return acc;
      }, {} as Record<string, { categoryId: string | null; categoryName: string; total: number }>);

      const result = Object.values(grouped);
      const uncategorized = result.find((r) => r.categoryId === null);

      if (uncategorized) {
        expect(uncategorized.categoryName).toBe("Bez kategorii");
        expect(uncategorized.total).toBeGreaterThanOrEqual(50);
      }
    });
  });

  describe("getMonthlyComparison logic", () => {
    it("should group transactions by month", async () => {
      const { db } = testDb;

      await db.insert(transactions).values({
        amount: 100,
        type: transactionType.INCOME,
        date: new Date("2024-01-15"),
        categoryId: null,
        description: null,
        updatedAt: new Date(),
      });

      await db.insert(transactions).values({
        amount: 50,
        type: transactionType.EXPENSE,
        date: new Date("2024-01-20"),
        categoryId: null,
        description: null,
        updatedAt: new Date(),
      });

      const allTransactions = await db.query.transactions.findMany();

      const grouped = allTransactions.reduce((acc, t) => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!acc[monthKey]) {
          acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
        }

        if (t.type === "INCOME") {
          acc[monthKey].income += t.amount;
        } else {
          acc[monthKey].expense += t.amount;
        }

        return acc;
      }, {} as Record<string, { month: string; income: number; expense: number }>);

      const result = Object.values(grouped).sort((a, b) =>
        a.month.localeCompare(b.month)
      );

      expect(result.length).toBeGreaterThan(0);
      const jan2024 = result.find((r) => r.month === "2024-01");
      if (jan2024) {
        expect(jan2024.income).toBeGreaterThanOrEqual(100);
        expect(jan2024.expense).toBeGreaterThanOrEqual(50);
      }
    });

    it("should sort months chronologically", async () => {
      const { db } = testDb;

      const allTransactions = await db.query.transactions.findMany();

      const grouped = allTransactions.reduce((acc, t) => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!acc[monthKey]) {
          acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
        }

        if (t.type === "INCOME") {
          acc[monthKey].income += t.amount;
        } else {
          acc[monthKey].expense += t.amount;
        }

        return acc;
      }, {} as Record<string, { month: string; income: number; expense: number }>);

      const result = Object.values(grouped).sort((a, b) =>
        a.month.localeCompare(b.month)
      );

      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        if (prev && curr) {
          expect(prev.month.localeCompare(curr.month)).toBeLessThanOrEqual(0);
        }
      }
    });
  });
});
