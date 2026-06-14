"use client";

import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { HiPencilSquare, HiPlusCircle } from "react-icons/hi2";
import { TransactionForm } from "./TransactionForm";
import type { Category, Transaction } from "@/db/schema";

type TransactionFormPageProps = {
  categories: Category[];
  transaction?: Transaction;
  title: string;
};

export function TransactionFormPage({ categories, transaction, title }: TransactionFormPageProps) {
  const router = useRouter();

  const handleNavigateBack = () => {
    router.push("/transactions");
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-2">
        {transaction ? (
          <HiPencilSquare className="text-xl text-primary" aria-hidden />
        ) : (
          <HiPlusCircle className="text-xl text-primary" aria-hidden />
        )}
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardBody>
        <TransactionForm
          categories={categories}
          transaction={transaction}
          onCancel={handleNavigateBack}
        />
      </CardBody>
    </Card>
  );
}
