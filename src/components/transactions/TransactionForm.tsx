"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  Textarea,
  DatePicker,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import { today, getLocalTimeZone } from "@internationalized/date";
import { editTransaction } from "@/app/transactions/actions";
import {
  calendarDateToDate,
  dateToCalendarDate,
  getMaxSelectableDate,
} from "@/lib/dateRange";
import { setPendingTransaction } from "@/lib/pending-transaction";
import { showSyncToast } from "@/lib/sync-toast";
import type { Category, Transaction } from "@/db/schema";

interface TransactionFormProps {
  categories: Category[];
  transaction?: Transaction;
  onCancel?: () => void;
}

type FieldErrors = {
  amount?: string;
  type?: string;
  date?: string;
  description?: string;
};

export function TransactionForm({
  categories,
  transaction,
  onCancel,
}: TransactionFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const isEditMode = !!transaction;

  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE" | "">("");
  const [dateValue, setDateValue] = useState<DateValue>(() =>
    today(getLocalTimeZone()),
  );
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setType(transaction.type as "INCOME" | "EXPENSE");
      setDateValue(dateToCalendarDate(new Date(transaction.date)));
      setCategoryId(transaction.categoryId || "");
      setDescription(transaction.description || "");
    }
  }, [transaction]);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      errors.amount = "Kwota musi być większa od 0";
    }

    if (!type || (type !== "INCOME" && type !== "EXPENSE")) {
      errors.type = "Wybierz typ transakcji";
    }

    const maxDate = getMaxSelectableDate();
    if (dateValue.compare(maxDate) > 0) {
      errors.date = "Data nie może być z przyszłości";
    }

    if (description.length > 500) {
      errors.description = "Opis nie może przekraczać 500 znaków";
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const parsedAmount = parseFloat(amount);
    const selectedDate = calendarDateToDate(dateValue);
    const transactionType = type as "INCOME" | "EXPENSE";
    const selectedCategory = categories.find((c) => c.id === categoryId);

    if (isEditMode) {
      startTransition(async () => {
        await showSyncToast(
          async () => {
            const result = await editTransaction(transaction.id, {
              amount: parsedAmount,
              type: transactionType,
              date: selectedDate,
              categoryId: categoryId || null,
              description: description || null,
            });

            if (!result.success) {
              throw new Error(result.error);
            }

            router.push("/transactions");
            return result;
          },
          {
            loading: "Zapisywanie transakcji...",
            success: "Transakcja została zaktualizowana",
            error: "Nie udało się zapisać transakcji",
          },
        );
      });
      return;
    }

    setPendingTransaction({
      tempId: `pending-${crypto.randomUUID()}`,
      amount: parsedAmount,
      type: transactionType,
      date: selectedDate.toISOString(),
      categoryId: categoryId || null,
      categoryName: selectedCategory?.name ?? null,
      description: description || null,
    });

    router.push("/transactions");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Kwota"
          type="number"
          step="0.01"
          value={amount}
          onValueChange={(value) => {
            setAmount(value);
            setFieldErrors((prev) => ({ ...prev, amount: undefined }));
          }}
          placeholder="0.00"
          isInvalid={!!fieldErrors.amount}
          errorMessage={fieldErrors.amount}
        />

        <Select
          label="Typ"
          selectedKeys={type ? [type] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setType((selected as "INCOME" | "EXPENSE") || "");
            setFieldErrors((prev) => ({ ...prev, type: undefined }));
          }}
          placeholder="Wybierz typ"
          isInvalid={!!fieldErrors.type}
          errorMessage={fieldErrors.type}
        >
          <SelectItem key="INCOME">Przychód</SelectItem>
          <SelectItem key="EXPENSE">Wydatek</SelectItem>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DatePicker
          label="Data"
          value={dateValue}
          onChange={(value) => {
            if (value) {
              setDateValue(value);
              setFieldErrors((prev) => ({ ...prev, date: undefined }));
            }
          }}
          maxValue={getMaxSelectableDate()}
          showMonthAndYearPickers
          isInvalid={!!fieldErrors.date}
          errorMessage={fieldErrors.date}
        />

        <Autocomplete
          label="Kategoria"
          placeholder="Wyszukaj kategorię (opcjonalnie)"
          selectedKey={categoryId || null}
          onSelectionChange={(key) => {
            setCategoryId((key as string) || "");
          }}
          allowsCustomValue={false}
        >
          {categories.map((category) => (
            <AutocompleteItem key={category.id}>{category.name}</AutocompleteItem>
          ))}
        </Autocomplete>
      </div>

      <Textarea
        label="Opis"
        value={description}
        onValueChange={(value: string) => {
          setDescription(value);
          setFieldErrors((prev) => ({ ...prev, description: undefined }));
        }}
        placeholder="Opcjonalny opis transakcji"
        description={`${description.length}/500 znaków`}
        isInvalid={!!fieldErrors.description}
        errorMessage={fieldErrors.description}
      />

      <div className="flex gap-2">
        {onCancel && (
          <Button variant="light" onPress={onCancel} className="flex-1">
            Anuluj
          </Button>
        )}
        <Button
          type="submit"
          color="primary"
          className={onCancel ? "flex-1" : "w-full"}
        >
          {isEditMode ? "Zapisz" : "Dodaj transakcję"}
        </Button>
      </div>
    </form>
  );
}
