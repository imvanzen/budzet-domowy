import { Suspense } from "react";
import { getPaginatedTransactions } from "@/services/transactions";
import { getCategories } from "@/services/categories";
import { getSettings } from "@/services/settings";
import { TransactionsManager } from "@/components/transactions/TransactionsManager";

async function TransactionsContent() {
  const [initialData, categories, settings] = await Promise.all([
    getPaginatedTransactions(),
    getCategories(),
    getSettings(),
  ]);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transakcje</h1>
      </div>

      <TransactionsManager
        initialData={initialData}
        categories={categories}
        currency={settings.currency}
      />
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
