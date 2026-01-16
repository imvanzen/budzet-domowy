"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import type { Transaction, Category } from "@/db/schema";
import { Badge, Chip } from "@heroui/react";

type TransactionsManagerProps = {
  initialTransactions: Array<
    Transaction & { category: { name: string } | null }
  >;
  categories: Category[];
};

export function TransactionsManager({
  initialTransactions,
  categories,
}: TransactionsManagerProps) {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuccess = () => {
    setEditingTransaction(null);
  };

  const handleCancel = () => {
    setEditingTransaction(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <h2 className="text-xl font-semibold">
            {editingTransaction ? "Edytuj transakcję" : "Dodaj transakcję"}
          </h2>
        </CardHeader>
        <CardBody>
          <TransactionForm
            categories={categories}
            transaction={editingTransaction || undefined}
            onSuccess={handleSuccess}
            onCancel={editingTransaction ? handleCancel : undefined}
          />
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Lista transakcji</h2>
            <Chip color="primary" size="sm" variant="solid">
              {initialTransactions.length}
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <TransactionList
            transactions={initialTransactions}
            onEdit={handleEdit}
          />
        </CardBody>
      </Card>
    </div>
  );
}
