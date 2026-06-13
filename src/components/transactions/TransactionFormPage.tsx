"use client";

import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { TransactionForm } from "./TransactionForm";
import type { Category, Transaction } from "@/db/schema";

type TransactionFormPageProps = {
  categories: Category[];
  transaction?: Transaction;
  title: string;
};

export function TransactionFormPage({
  categories,
  transaction,
  title,
}: TransactionFormPageProps) {
  const router = useRouter();

  const handleNavigateBack = () => {
    router.push("/transactions");
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardBody>
        <TransactionForm
          categories={categories}
          transaction={transaction}
          onSuccess={handleNavigateBack}
          onCancel={handleNavigateBack}
        />
      </CardBody>
    </Card>
  );
}
