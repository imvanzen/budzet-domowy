"use client";

import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import type { DateValue } from "@internationalized/date";
import type { RangeValue } from "@react-types/shared";
import {
  HiArrowTrendingDown,
  HiArrowTrendingUp,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import type { Category, TransactionType } from "@/db/schema";
import { transactionType } from "@/db/schema";
import type { TransactionPeriodPreset } from "@/lib/dateRange";
import { TransactionDateRangeFilter } from "./TransactionDateRangeFilter";

type TransactionFiltersProps = {
  categories: Category[];
  selectedType?: TransactionType | "ALL";
  selectedCategoryId?: string | "ALL";
  datePreset: TransactionPeriodPreset;
  dateRange: RangeValue<DateValue>;
  searchPhrase?: string;
  onTypeChange: (type: TransactionType | "ALL") => void;
  onCategoryChange: (categoryId: string | "ALL") => void;
  onDateFilterChange: (
    preset: TransactionPeriodPreset,
    range: RangeValue<DateValue>,
  ) => void;
  onSearchChange: (phrase: string) => void;
};

export function TransactionFilters({
  categories,
  selectedType = "ALL",
  selectedCategoryId = "ALL",
  datePreset,
  dateRange,
  searchPhrase = "",
  onTypeChange,
  onCategoryChange,
  onDateFilterChange,
  onSearchChange,
}: TransactionFiltersProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Szukaj"
        placeholder="Wyszukaj w nazwie lub opisie..."
        value={searchPhrase}
        onValueChange={onSearchChange}
        aria-label="Szukaj"
        isClearable
        onClear={() => onSearchChange("")}
        startContent={
          <HiMagnifyingGlass className="text-default-400" aria-hidden />
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Select
          label="Typ transakcji"
          selectedKeys={selectedType ? [selectedType] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            onTypeChange((selected || "ALL") as TransactionType | "ALL");
          }}
          placeholder="Wszystkie"
        >
          <SelectItem key="ALL">Wszystkie</SelectItem>
          <SelectItem
            key={transactionType.INCOME}
            startContent={
              <HiArrowTrendingUp className="text-success" aria-hidden />
            }
          >
            Przychód
          </SelectItem>
          <SelectItem
            key={transactionType.EXPENSE}
            startContent={
              <HiArrowTrendingDown className="text-danger" aria-hidden />
            }
          >
            Wydatek
          </SelectItem>
        </Select>

        <Select
          label="Kategoria"
          selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            onCategoryChange((selected || "ALL") as string | "ALL");
          }}
          placeholder="Wszystkie"
        >
          {[{ id: "ALL", name: "Wszystkie" }, ...categories].map((item) => (
            <SelectItem key={item.id}>{item.name}</SelectItem>
          ))}
        </Select>

        <TransactionDateRangeFilter
          preset={datePreset}
          dateRange={dateRange}
          onDateFilterChange={onDateFilterChange}
        />
      </div>
    </div>
  );
}
