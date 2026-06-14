"use client";

import { useState, useTransition, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Pagination } from "@heroui/react";
import { TransactionList } from "./TransactionList";
import { TransactionFilters } from "./TransactionFilters";
import type { Category, Currency } from "@/db/schema";
import { Chip } from "@heroui/react";
import {
  addTransaction,
  getFilteredTransactions,
} from "@/app/transactions/actions";
import type { PaginatedResult, TransactionWithCategory } from "@/services/transactions";
import { buildTransactionFiltersFromUrlState } from "@/lib/transaction-filters-url";
import { consumePendingTransaction } from "@/lib/pending-transaction";
import { showSyncToast } from "@/lib/sync-toast";
import { useTransactionFiltersUrl } from "@/hooks/use-transaction-filters-url";

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
  const categoryIds = useMemo(
    () => categories.map((category) => category.id),
    [categories],
  );

  const {
    selectedType,
    selectedCategoryId,
    datePreset,
    dateRange,
    searchInput,
    debouncedSearchPhrase,
    page,
    setType,
    setCategoryId,
    setDateFilter,
    setSearchInput,
    setPage,
  } = useTransactionFiltersUrl({
    categoryIds,
  });

  const dateRangeKey = useMemo(
    () =>
      `${dateRange.start.year}-${dateRange.start.month}-${dateRange.start.day}:${dateRange.end.year}-${dateRange.end.month}-${dateRange.end.day}`,
    [dateRange],
  );

  const [data, setData] = useState(initialData);
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

            const filters = buildTransactionFiltersFromUrlState({
              selectedType,
              selectedCategoryId,
              dateRange,
              searchPhrase: debouncedSearchPhrase,
            });
            const refreshed = await getFilteredTransactions(filters, 1);
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
  }, [
    router,
    selectedType,
    selectedCategoryId,
    dateRange,
    debouncedSearchPhrase,
    setPage,
  ]);

  useEffect(() => {
    const fetchFilteredTransactions = () => {
      startTransition(async () => {
        const filters = buildTransactionFiltersFromUrlState({
          selectedType,
          selectedCategoryId,
          dateRange,
          searchPhrase: debouncedSearchPhrase,
        });

        const result = await getFilteredTransactions(filters, page);
        setData(result);
      });
    };

    fetchFilteredTransactions();
  }, [
    selectedType,
    selectedCategoryId,
    dateRangeKey,
    debouncedSearchPhrase,
    page,
  ]);

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
            datePreset={datePreset}
            dateRange={dateRange}
            searchPhrase={searchInput}
            onTypeChange={setType}
            onCategoryChange={setCategoryId}
            onDateFilterChange={setDateFilter}
            onSearchChange={setSearchInput}
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
