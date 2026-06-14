import { Suspense } from "react";
import { notFound } from "next/navigation";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { getCategories } from "@/services/categories";
import { getTransaction } from "@/services/transactions";
import { TransactionFormPage } from "@/components/transactions/TransactionFormPage";

type EditTransactionPageProps = {
  params: Promise<{ id: string }>;
};

async function EditTransactionContent({ id }: { id: string }) {
  const [transaction, categories] = await Promise.all([
    getTransaction(id),
    getCategories(),
  ]);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="flex items-center gap-3 text-3xl font-bold">
        <HiArrowsRightLeft className="text-primary" aria-hidden />
        Transakcje
      </h1>
      <TransactionFormPage
        categories={categories}
        transaction={transaction}
        title="Edytuj transakcję"
      />
    </div>
  );
}

export default function EditTransactionPage({ params }: EditTransactionPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-6xl p-6">
          <div className="text-center">Ładowanie...</div>
        </div>
      }
    >
      <EditTransactionContentWrapper params={params} />
    </Suspense>
  );
}

async function EditTransactionContentWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditTransactionContent id={id} />;
}
