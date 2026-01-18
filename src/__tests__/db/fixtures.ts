import type { NewCategory, NewTransaction, NewSettings } from "@/db/schema";
import {
  transactionType,
  currency,
  categories,
  transactions,
  settings,
} from "@/db/schema";

export const testCategories: NewCategory[] = [
  {
    id: "cat-1",
    name: "Food",
  },
  {
    id: "cat-2",
    name: "Transport",
  },
  {
    id: "cat-3",
    name: "Salary",
  },
];

export const testTransactions: NewTransaction[] = [
  {
    id: "txn-1",
    amount: 100.0,
    type: transactionType.INCOME,
    date: new Date("2024-01-15"),
    description: "Salary payment",
    categoryId: "cat-3",
  },
  {
    id: "txn-2",
    amount: 50.0,
    type: transactionType.EXPENSE,
    date: new Date("2024-01-16"),
    description: "Grocery shopping",
    categoryId: "cat-1",
  },
  {
    id: "txn-3",
    amount: 25.0,
    type: transactionType.EXPENSE,
    date: new Date("2024-01-17"),
    description: "Bus ticket",
    categoryId: "cat-2",
  },
];

export const testSettings: NewSettings = {
  id: "singleton",
  currency: currency.PLN,
};

import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "@/db/schema";

export async function seedTestDb(
  db: LibSQLDatabase<typeof schema>
) {
  await db.insert(categories).values(testCategories);
  await db.insert(transactions).values(testTransactions);
  await db.insert(settings).values(testSettings);
}
