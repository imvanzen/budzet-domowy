import { Suspense } from "react";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { TransactionsSkeleton } from "@/components/skeletons/TransactionsSkeleton";
import { TransactionsManager } from "@/components/transactions/TransactionsManager";
import { getCategories } from "@/services/categories";
import { getSettings } from "@/services/settings";
import { getPaginatedTransactions } from "@/services/transactions";

async function TransactionsContent() {
  const [initialData, categories, settings] = await Promise.all([
    getPaginatedTransactions(),
    getCategories(),
    getSettings(),
  ]);

  return (
    <TransactionsManager
      initialData={initialData}
      categories={categories}
      currency={settings.currency}
    />
  );
}

export default function TransactionsPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <HiArrowsRightLeft className="text-primary" aria-hidden />
          Transakcje
        </h1>
      </div>

      <Suspense fallback={<TransactionsSkeleton />}>
        <TransactionsContent />
      </Suspense>
    </div>
  );
}
