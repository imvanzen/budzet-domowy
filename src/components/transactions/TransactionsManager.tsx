"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { TransactionFilters } from "./TransactionFilters";
import type { Transaction, Category, TransactionType } from "@/db/schema";
import { Chip } from "@heroui/react";
import { getFilteredTransactions } from "@/app/transactions/actions";

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
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedType, setSelectedType] = useState<TransactionType | "ALL">("ALL");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "ALL">("ALL");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchFilteredTransactions = () => {
      startTransition(async () => {
        const filters: { type?: TransactionType; categoryId?: string } = {};
        
        if (selectedType !== "ALL") {
          filters.type = selectedType;
        }
        
        if (selectedCategoryId !== "ALL") {
          filters.categoryId = selectedCategoryId;
        }

        const filtered = await getFilteredTransactions(
          Object.keys(filters).length > 0 ? filters : undefined
        );
        
        setTransactions(filtered);
      });
    };

    fetchFilteredTransactions();
  }, [selectedType, selectedCategoryId]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuccess = () => {
    setEditingTransaction(null);
    // Refresh transactions after adding/editing
    startTransition(async () => {
      const filters: { type?: TransactionType; categoryId?: string } = {};
      
      if (selectedType !== "ALL") {
        filters.type = selectedType;
      }
      
      if (selectedCategoryId !== "ALL") {
        filters.categoryId = selectedCategoryId;
      }

      const filtered = await getFilteredTransactions(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      
      setTransactions(filtered);
    });
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
              {transactions.length}
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <TransactionFilters
              categories={categories}
              selectedType={selectedType}
              selectedCategoryId={selectedCategoryId}
              onTypeChange={setSelectedType}
              onCategoryChange={setSelectedCategoryId}
            />
            
            {isPending && (
              <div className="text-center text-default-500">Ładowanie...</div>
            )}
            
            <div className={isPending ? "opacity-50" : ""}>
              <TransactionList
                transactions={transactions}
                onEdit={handleEdit}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
