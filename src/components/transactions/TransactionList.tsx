"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  HiPencil,
  HiTrash,
  HiCalendarDays,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiInbox,
  HiTag,
} from "react-icons/hi2";
import { formatCurrency, formatDate } from "@/lib/format";
import { transactionType } from "@/db/schema";
import type { Currency } from "@/db/schema";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { removeTransaction } from "@/app/transactions/actions";
import type { TransactionWithCategory } from "@/services/transactions";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  currency: Currency;
  pendingIds?: Set<string>;
}

export function TransactionList({
  transactions,
  currency,
  pendingIds = new Set(),
}: TransactionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [_isDeleting, setIsDeleting] = useState(false);

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
        <HiInbox className="mx-auto mb-3 text-4xl text-default-300" aria-hidden />
        <p className="text-default-500">Brak transakcji</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {transactions.map((transaction) => {
          const isPending = pendingIds.has(transaction.id);

          return (
            <div
              key={transaction.id}
              className={`flex items-center justify-between gap-4 rounded-lg border border-default-200 p-4 transition-opacity ${
                isPending ? "opacity-70" : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      transaction.type === transactionType.INCOME
                        ? "bg-success-100 text-success-800"
                        : "bg-danger-100 text-danger-800"
                    }`}
                  >
                    {transaction.type === transactionType.INCOME ? (
                      <HiArrowTrendingUp aria-hidden />
                    ) : (
                      <HiArrowTrendingDown aria-hidden />
                    )}
                    {transaction.type === transactionType.INCOME ? "Przychód" : "Wydatek"}
                  </span>
                  {isPending && <span className="text-xs text-default-400">Zapisywanie...</span>}
                  <span className="flex items-center gap-1 text-sm text-default-500">
                    <HiCalendarDays className="text-default-400" aria-hidden />
                    {formatDate(transaction.date)}
                  </span>
                </div>
                <div className="mt-1">
                  {transaction.category && (
                    <span className="flex items-center gap-1 text-sm text-default-600">
                      <HiTag className="text-default-400" aria-hidden />
                      {transaction.category.name}
                    </span>
                  )}
                  {transaction.description && (
                    <p className="text-sm text-default-500">{transaction.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p
                  className={`text-lg font-semibold ${
                    transaction.type === transactionType.INCOME ? "text-success" : "text-danger"
                  }`}
                >
                  {transaction.type === transactionType.INCOME ? "+" : "-"}
                  {formatCurrency(transaction.amount, currency)}
                </p>
                <Link href={`/transactions/${transaction.id}/edit`}>
                  <Button
                    size="sm"
                    variant="light"
                    isDisabled={isPending}
                    startContent={<HiPencil aria-hidden />}
                  >
                    Edytuj
                  </Button>
                </Link>
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  isDisabled={isPending}
                  onPress={() => setDeleteId(transaction.id)}
                  startContent={<HiTrash aria-hidden />}
                >
                  Usuń
                </Button>
              </div>
            </div>
          );
        })}
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
