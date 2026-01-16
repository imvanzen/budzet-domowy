import db from "@/db";
import { transactions } from "@/db/schema";
import { desc, eq, and, gte, lte } from "drizzle-orm";
import type { NewTransaction, Transaction, TransactionType } from "@/db/schema";

export async function createTransaction(
  input: Omit<NewTransaction, "id" | "createdAt" | "updatedAt">
): Promise<Transaction> {
  const [transaction] = await db
    .insert(transactions)
    .values({
      ...input,
      updatedAt: new Date(),
    })
    .returning();

  return transaction;
}

export async function updateTransaction(
  id: string,
  input: Partial<Omit<NewTransaction, "id" | "createdAt" | "updatedAt">>
): Promise<Transaction> {
  const [transaction] = await db
    .update(transactions)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, id))
    .returning();

  return transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.delete(transactions).where(eq(transactions.id, id));
}

export async function getTransaction(id: string): Promise<Transaction | undefined> {
  return db.query.transactions.findFirst({
    where: eq(transactions.id, id),
  });
}

export type TransactionFilters = {
  dateFrom?: Date;
  dateTo?: Date;
  type?: TransactionType;
  categoryId?: string;
};

export async function getTransactions(
  filters?: TransactionFilters
): Promise<Array<Transaction & { category: { name: string } | null }>> {
  const conditions = [];

  if (filters?.dateFrom) {
    conditions.push(gte(transactions.date, filters.dateFrom));
  }
  if (filters?.dateTo) {
    conditions.push(lte(transactions.date, filters.dateTo));
  }
  if (filters?.type) {
    conditions.push(eq(transactions.type, filters.type));
  }
  if (filters?.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }

  const result = await db.query.transactions.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(transactions.date)],
    with: {
      category: true,
    },
  });

  return result.map((t) => ({
    ...t,
    category: t.category ? { name: t.category.name } : null,
  }));
}

export type SummaryData = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export async function getSummary(filters?: TransactionFilters): Promise<SummaryData> {
  const allTransactions = await getTransactions(filters);

  const totalIncome = allTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = allTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
  };
}

export type CategoryExpense = {
  categoryId: string | null;
  categoryName: string;
  total: number;
};

export async function getExpensesByCategory(
  filters?: TransactionFilters
): Promise<CategoryExpense[]> {
  const allTransactions = await getTransactions(filters);
  const expenses = allTransactions.filter((t) => t.type === "EXPENSE");

  const grouped = expenses.reduce((acc, t) => {
    const key = t.categoryId || "null";
    const name = t.category?.name || "Bez kategorii";
    
    if (!acc[key]) {
      acc[key] = { categoryId: t.categoryId, categoryName: name, total: 0 };
    }
    acc[key].total += t.amount;
    return acc;
  }, {} as Record<string, CategoryExpense>);

  return Object.values(grouped);
}

export type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

export async function getMonthlyComparison(
  filters?: TransactionFilters
): Promise<MonthlyData[]> {
  const allTransactions = await getTransactions(filters);

  const grouped = allTransactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
    }
    
    if (t.type === "INCOME") {
      acc[monthKey].income += t.amount;
    } else {
      acc[monthKey].expense += t.amount;
    }
    
    return acc;
  }, {} as Record<string, MonthlyData>);

  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}
