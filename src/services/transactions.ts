import db from "@/db";
import { transactions, categories } from "@/db/schema";
import { desc, eq, and, gte, lte, count, or, exists, sql } from "drizzle-orm";
import type { NewTransaction, Transaction, TransactionType } from "@/db/schema";

export const DEFAULT_PAGE_SIZE = 10;

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TransactionWithCategory = Transaction & {
  category: { name: string } | null;
};

export async function createTransaction(
  input: Omit<NewTransaction, "id" | "createdAt" | "updatedAt">,
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
  input: Partial<Omit<NewTransaction, "id" | "createdAt" | "updatedAt">>,
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
  query?: string;
};

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function buildTransactionConditions(filters?: TransactionFilters) {
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
  if (filters?.query) {
    const trimmed = filters.query.trim();
    if (trimmed) {
      const pattern = `%${escapeLikePattern(trimmed)}%`;
      conditions.push(
        or(
          sql`lower(${transactions.description}) like lower(${pattern})`,
          exists(
            db
              .select({ one: sql`1` })
              .from(categories)
              .where(
                and(
                  eq(categories.id, transactions.categoryId),
                  sql`lower(${categories.name}) like lower(${pattern})`,
                ),
              ),
          ),
        ),
      );
    }
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function mapTransactionWithCategory(
  t: Transaction & { category: { name: string } | null },
): TransactionWithCategory {
  return {
    ...t,
    category: t.category ? { name: t.category.name } : null,
  };
}

export async function getTransactions(
  filters?: TransactionFilters,
): Promise<TransactionWithCategory[]> {
  const result = await db.query.transactions.findMany({
    where: buildTransactionConditions(filters),
    orderBy: [desc(transactions.date)],
    with: {
      category: true,
    },
  });

  return result.map(mapTransactionWithCategory);
}

export async function getPaginatedTransactions(
  filters?: TransactionFilters,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<TransactionWithCategory>> {
  const whereClause = buildTransactionConditions(filters);
  const safePage = Math.max(1, page);

  const [totalResult] = await db.select({ count: count() }).from(transactions).where(whereClause);

  const total = totalResult?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(safePage, totalPages);
  const offset = (currentPage - 1) * pageSize;

  const result = await db.query.transactions.findMany({
    where: whereClause,
    orderBy: [desc(transactions.date)],
    limit: pageSize,
    offset,
    with: {
      category: true,
    },
  });

  return {
    items: result.map(mapTransactionWithCategory),
    total,
    page: currentPage,
    pageSize,
    totalPages,
  };
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
  filters?: TransactionFilters,
): Promise<CategoryExpense[]> {
  const allTransactions = await getTransactions(filters);
  const expenses = allTransactions.filter((t) => t.type === "EXPENSE");

  const grouped = expenses.reduce(
    (acc, t) => {
      const key = t.categoryId || "null";
      const name = t.category?.name || "Bez kategorii";

      if (!acc[key]) {
        acc[key] = { categoryId: t.categoryId, categoryName: name, total: 0 };
      }
      acc[key].total += t.amount;
      return acc;
    },
    {} as Record<string, CategoryExpense>,
  );

  return Object.values(grouped);
}

export type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

export async function getMonthlyComparison(filters?: TransactionFilters): Promise<MonthlyData[]> {
  const allTransactions = await getTransactions(filters);

  const grouped = allTransactions.reduce(
    (acc, t) => {
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
    },
    {} as Record<string, MonthlyData>,
  );

  return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
}
