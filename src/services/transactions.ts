import db from "@/db";
import { transactions } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { NewTransaction, Transaction } from "@/db/schema";

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

export async function getTransactions(): Promise<
  Array<Transaction & { category: { name: string } | null }>
> {
  const result = await db.query.transactions.findMany({
    orderBy: [desc(transactions.date)],
    with: {
      category: true,
    },
  });

  return result.map((t: (typeof result)[0]) => ({
    ...t,
    category: t.category ? { name: t.category.name } : null,
  }));
}
