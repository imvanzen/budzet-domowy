"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { transactionType } from "@/db/schema";
import type { Transaction } from "@/db/schema";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { removeTransaction } from "@/app/transactions/actions";

interface TransactionListProps {
  transactions: Array<Transaction & { category: { name: string } | null }>;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  onEdit,
}: TransactionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    await removeTransaction(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-default-200 p-8 text-center">
        <p className="text-default-500">Brak transakcji</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2 max-h-[calc(100vh-30rem)] overflow-y-auto">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-default-200 p-4"
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
            <div className="flex items-center gap-2">
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
              {onEdit && (
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => onEdit(transaction)}
                >
                  Edytuj
                </Button>
              )}
              <Button
                size="sm"
                color="danger"
                variant="light"
                onPress={() => setDeleteId(transaction.id)}
              >
                Usuń
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Usuń transakcję"
        message="Czy na pewno chcesz usunąć tę transakcję? Tej operacji nie można cofnąć."
        confirmText="Usuń"
        cancelText="Anuluj"
        isDanger
      />
    </>
  );
}
