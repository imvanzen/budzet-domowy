import { Suspense } from "react";
import { getCategories } from "@/services/categories";
import { TransactionFormPage } from "@/components/transactions/TransactionFormPage";

async function NewTransactionContent() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Transakcje</h1>
      <TransactionFormPage
        categories={categories}
        title="Dodaj transakcję"
      />
    </div>
  );
}

export default function NewTransactionPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-6xl p-6">
          <div className="text-center">Ładowanie...</div>
        </div>
      }
    >
      <NewTransactionContent />
    </Suspense>
  );
}
