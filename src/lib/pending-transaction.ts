import type { TransactionType } from "@/db/schema";

export type PendingTransaction = {
  tempId: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string | null;
  categoryName: string | null;
  description: string | null;
};

const STORAGE_KEY = "pending-transaction";

export function setPendingTransaction(transaction: PendingTransaction): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(transaction));
}

export function consumePendingTransaction(): PendingTransaction | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(STORAGE_KEY);

  try {
    return JSON.parse(raw) as PendingTransaction;
  } catch {
    return null;
  }
}

export function isPendingTransactionId(id: string): boolean {
  return id.startsWith("pending-");
}
