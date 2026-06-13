"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Pagination } from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import type { RangeValue } from "@react-types/shared";
import { TransactionList } from "./TransactionList";
import { TransactionFilters } from "./TransactionFilters";
import type { Category, TransactionType, Currency } from "@/db/schema";
import { Chip } from "@heroui/react";
import {
  addTransaction,
  getFilteredTransactions,
} from "@/app/transactions/actions";
import type { PaginatedResult, TransactionWithCategory } from "@/services/transactions";
import {
  calendarDateRangeToDates,
  validateTransactionDateRange,
} from "@/lib/dateRange";
import {
  consumePendingTransaction,
} from "@/lib/pending-transaction";
import { showSyncToast } from "@/lib/sync-toast";

type TransactionsManagerProps = {
  initialData: PaginatedResult<TransactionWithCategory>;
  categories: Category[];
  currency: Currency;
};

export function TransactionsManager({
  initialData,
  categories,
  currency,
}: TransactionsManagerProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(initialData.page);
  const [selectedType, setSelectedType] = useState<TransactionType | "ALL">("ALL");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "ALL">("ALL");
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const pendingSyncStarted = useRef(false);

  useEffect(() => {
    const pending = consumePendingTransaction();
    if (!pending || pendingSyncStarted.current) return;

    pendingSyncStarted.current = true;

    const optimisticTransaction: TransactionWithCategory = {
      id: pending.tempId,
      amount: pending.amount,
      type: pending.type,
      date: new Date(pending.date),
      categoryId: pending.categoryId,
      description: pending.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: pending.categoryName ? { name: pending.categoryName } : null,
    };

    setPendingIds((prev) => new Set(prev).add(pending.tempId));
    setData((prev) => ({
      ...prev,
      items: [optimisticTransaction, ...prev.items],
      total: prev.total + 1,
    }));

    startTransition(async () => {
      try {
        await showSyncToast(
          async () => {
            const result = await addTransaction({
              amount: pending.amount,
              type: pending.type,
              date: new Date(pending.date),
              categoryId: pending.categoryId,
              description: pending.description,
            });

            if (!result.success) {
              throw new Error(result.error);
            }

            const refreshed = await getFilteredTransactions(undefined, 1);
            setData(refreshed);
            setPage(1);
            router.refresh();
            return result;
          },
          {
            loading: "Zapisywanie transakcji...",
            success: "Transakcja została dodana",
            error: "Nie udało się dodać transakcji",
          },
        );
      } catch {
        setData((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.id !== pending.tempId),
          total: Math.max(0, prev.total - 1),
        }));
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(pending.tempId);
          return next;
        });
      }
    });
  }, [router]);

  useEffect(() => {
    const fetchFilteredTransactions = () => {
      startTransition(async () => {
        const filters: {
          type?: TransactionType;
          categoryId?: string;
          dateFrom?: Date;
          dateTo?: Date;
        } = {};

        if (selectedType !== "ALL") {
          filters.type = selectedType;
        }

        if (selectedCategoryId !== "ALL") {
          filters.categoryId = selectedCategoryId;
        }

        if (
          dateRange?.start &&
          dateRange?.end &&
          !validateTransactionDateRange(dateRange)
        ) {
          const { dateFrom, dateTo } = calendarDateRangeToDates(dateRange);
          filters.dateFrom = dateFrom;
          filters.dateTo = dateTo;
        }

        const result = await getFilteredTransactions(
          Object.keys(filters).length > 0 ? filters : undefined,
          page
        );

        setData(result);
      });
    };

    fetchFilteredTransactions();
  }, [selectedType, selectedCategoryId, dateRange, page]);

  const handleTypeChange = (type: TransactionType | "ALL") => {
    setSelectedType(type);
    setPage(1);
  };

  const handleCategoryChange = (categoryId: string | "ALL") => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  const handleDateRangeChange = (range: RangeValue<DateValue> | null) => {
    setDateRange(range);
    setPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Lista transakcji</h2>
            <Chip color="primary" size="sm" variant="solid">
              {data.total}
            </Chip>
          </div>
          <Link href="/transactions/new">
            <Button color="primary">Dodaj transakcję</Button>
          </Link>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <TransactionFilters
            categories={categories}
            selectedType={selectedType}
            selectedCategoryId={selectedCategoryId}
            dateRange={dateRange}
            onTypeChange={handleTypeChange}
            onCategoryChange={handleCategoryChange}
            onDateRangeChange={handleDateRangeChange}
          />

          {isPending && (
            <div className="text-center text-default-500">Ładowanie...</div>
          )}

          <div className={isPending ? "opacity-50" : ""}>
            <TransactionList
              transactions={data.items}
              currency={currency}
              pendingIds={pendingIds}
            />
          </div>

          {data.totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination
                total={data.totalPages}
                page={page}
                onChange={setPage}
                showControls
                color="primary"
                aria-label="Paginacja transakcji"
              />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
