import { Suspense } from "react";
import { getTransactions } from "@/services/transactions";
import { getCategories } from "@/services/categories";
import { TransactionsManager } from "@/components/transactions/TransactionsManager";

async function TransactionsContent() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transakcje</h1>
      </div>

      <TransactionsManager initialTransactions={transactions} categories={categories} />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-6xl p-6">
          <div className="text-center">Ładowanie...</div>
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}
