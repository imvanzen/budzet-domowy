import { Suspense } from "react";
import { getTransactions } from "@/services/transactions";
import { getCategories } from "@/services/categories";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Card, CardBody, CardHeader } from "@heroui/card";

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-xl font-semibold">Dodaj transakcję</h2>
          </CardHeader>
          <CardBody>
            <TransactionForm categories={categories} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold">Lista transakcji</h2>
          </CardHeader>
          <CardBody>
            <TransactionList transactions={transactions} />
          </CardBody>
        </Card>
      </div>
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
