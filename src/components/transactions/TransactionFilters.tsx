"use client";

import { Select, SelectItem, DateRangePicker } from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import type { RangeValue } from "@react-types/shared";
import type { Category, TransactionType } from "@/db/schema";
import { transactionType } from "@/db/schema";
import {
  getMaxSelectableDate,
  validateTransactionDateRange,
} from "@/lib/dateRange";

type TransactionFiltersProps = {
  categories: Category[];
  selectedType?: TransactionType | "ALL";
  selectedCategoryId?: string | "ALL";
  dateRange?: RangeValue<DateValue> | null;
  onTypeChange: (type: TransactionType | "ALL") => void;
  onCategoryChange: (categoryId: string | "ALL") => void;
  onDateRangeChange: (range: RangeValue<DateValue> | null) => void;
};

export function TransactionFilters({
  categories,
  selectedType = "ALL",
  selectedCategoryId = "ALL",
  dateRange = null,
  onTypeChange,
  onCategoryChange,
  onDateRangeChange,
}: TransactionFiltersProps) {
  const maxDate = getMaxSelectableDate();

  const handleDateRangeChange = (value: RangeValue<DateValue> | null) => {
    if (!value?.start || !value?.end) {
      onDateRangeChange(value);
      return;
    }

    const error = validateTransactionDateRange(value);
    if (error) {
      return;
    }

    onDateRangeChange(value);
  };

  return (
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
        <SelectItem key={transactionType.INCOME}>Przychód</SelectItem>
        <SelectItem key={transactionType.EXPENSE}>Wydatek</SelectItem>
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
        {[
          { id: "ALL", name: "Wszystkie" },
          ...categories,
        ].map((item) => (
          <SelectItem key={item.id}>
            {item.name}
          </SelectItem>
        ))}
      </Select>

      <DateRangePicker
        label="Zakres dat"
        value={dateRange}
        onChange={handleDateRangeChange}
        maxValue={maxDate}
        validate={(value) => {
          const error = validateTransactionDateRange(value);
          return error ?? true;
        }}
        validationBehavior="aria"
        aria-label="Zakres dat"
      />
    </div>
  );
}
