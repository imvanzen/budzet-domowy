import { formatCurrency, formatDate } from "@/lib/format";
import { transactionType } from "@/db/schema";
import type { Transaction } from "@/db/schema";

interface TransactionListProps {
  transactions: Array<Transaction & { category: { name: string } | null }>;
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-default-200 p-8 text-center">
        <p className="text-default-500">Brak transakcji</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between rounded-lg border border-default-200 p-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  transaction.type === transactionType.INCOME
                    ? "bg-success-100 text-success-800"
                    : "bg-danger-100 text-danger-800"
                }`}
              >
                {transaction.type === transactionType.INCOME
                  ? "Przychód"
                  : "Wydatek"}
              </span>
              <span className="text-sm text-default-500">
                {formatDate(transaction.date)}
              </span>
            </div>
            <div className="mt-1">
              {transaction.category && (
                <span className="text-sm text-default-600">
                  {transaction.category.name}
                </span>
              )}
              {transaction.description && (
                <p className="text-sm text-default-500">
                  {transaction.description}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p
              className={`text-lg font-semibold ${
                transaction.type === transactionType.INCOME
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {transaction.type === transactionType.INCOME ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
