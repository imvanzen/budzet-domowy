"use client";

import { Select, SelectItem } from "@heroui/react";
import type { Category, TransactionType } from "@/db/schema";
import { transactionType } from "@/db/schema";

type TransactionFiltersProps = {
  categories: Category[];
  selectedType?: TransactionType | "ALL";
  selectedCategoryId?: string | "ALL";
  onTypeChange: (type: TransactionType | "ALL") => void;
  onCategoryChange: (categoryId: string | "ALL") => void;
};

export function TransactionFilters({
  categories,
  selectedType = "ALL",
  selectedCategoryId = "ALL",
  onTypeChange,
  onCategoryChange,
}: TransactionFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
    </div>
  );
}


