"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/react";
import { addTransaction, editTransaction } from "@/app/transactions/actions";
import type { Category, Transaction } from "@/db/schema";

interface TransactionFormProps {
  categories: Category[];
  transaction?: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({
  categories,
  transaction,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const isEditMode = !!transaction;

  const [formData, setFormData] = useState<{
    amount: string;
    type: "INCOME" | "EXPENSE" | "";
    date: string;
    categoryId: string;
    description: string;
  }>({
    amount: "",
    type: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    description: "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        type: transaction.type as "INCOME" | "EXPENSE",
        date: new Date(transaction.date).toISOString().split("T")[0],
        categoryId: transaction.categoryId || "",
        description: transaction.description || "",
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validation
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      setError("Kwota musi być większa od 0");
      return;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
      setError("Data nie może być z przyszłości");
      return;
    }

    if (
      !formData.type ||
      (formData.type !== "INCOME" && formData.type !== "EXPENSE")
    ) {
      setError("Wybierz typ transakcji");
      return;
    }

    if (formData.description && formData.description.length > 500) {
      setError("Opis nie może przekraczać 500 znaków");
      return;
    }

    const transactionType: "INCOME" | "EXPENSE" = formData.type;

    startTransition(async () => {
      const result = isEditMode
        ? await editTransaction(transaction.id, {
            amount,
            type: transactionType,
            date: selectedDate,
            categoryId: formData.categoryId || null,
            description: formData.description || null,
          })
        : await addTransaction({
            amount,
            type: transactionType,
            date: selectedDate,
            categoryId: formData.categoryId || null,
            description: formData.description || null,
          });

      if (result.success) {
        setSuccess(true);
        if (!isEditMode) {
          // Reset form only for add mode
          setFormData({
            amount: "",
            type: "",
            date: new Date().toISOString().split("T")[0],
            categoryId: "",
            description: "",
          });
        }
        // Call onSuccess callback if provided
        setTimeout(() => {
          setSuccess(false);
          onSuccess?.();
        }, 1500);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Kwota"
          type="number"
          step="0.01"
          value={formData.amount}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, amount: value }))
          }
          placeholder="0.00"
          description="Kwota musi być większa od 0"
        />

        <Select
          label="Typ"
          selectedKeys={formData.type ? [formData.type] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFormData((prev) => ({
              ...prev,
              type: (selected as "INCOME" | "EXPENSE") || "",
            }));
          }}
          placeholder="Wybierz typ"
        >
          <SelectItem key="INCOME">Przychód</SelectItem>
          <SelectItem key="EXPENSE">Wydatek</SelectItem>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Data"
          type="date"
          value={formData.date}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, date: value }))
          }
          description="Data nie może być z przyszłości"
        />

        <Select
          label="Kategoria"
          selectedKeys={formData.categoryId ? [formData.categoryId] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string | undefined;
            setFormData((prev) => ({
              ...prev,
              categoryId: selected || "",
            }));
          }}
          placeholder="Wybierz kategorię (opcjonalnie)"
        >
          {categories.map((category) => (
            <SelectItem key={category.id}>{category.name}</SelectItem>
          ))}
        </Select>
      </div>

      <Textarea
        label="Opis"
        value={formData.description}
        onValueChange={(value: string) =>
          setFormData((prev) => ({ ...prev, description: value }))
        }
        placeholder="Opcjonalny opis transakcji"
        description={`${formData.description.length}/500 znaków`}
      />

      {error && (
        <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-50 p-3 text-sm text-success">
          {isEditMode
            ? "Transakcja została zaktualizowana!"
            : "Transakcja została dodana pomyślnie!"}
        </div>
      )}

      <div className="flex gap-2">
        {isEditMode && onCancel && (
          <Button variant="light" onPress={onCancel} className="flex-1">
            Anuluj
          </Button>
        )}
        <Button
          type="submit"
          color="primary"
          isLoading={isPending}
          className={isEditMode ? "flex-1" : "w-full"}
        >
          {isPending
            ? isEditMode
              ? "Zapisywanie..."
              : "Dodawanie..."
            : isEditMode
              ? "Zapisz"
              : "Dodaj transakcję"}
        </Button>
      </div>
    </form>
  );
}
