"use client";

import { DateRangePicker } from "@heroui/react";
import type { DateValue } from "@internationalized/date";
import type { RangeValue } from "@react-types/shared";
import {
  TRANSACTION_PERIOD_PRESETS,
  detectTransactionPeriodPreset,
  getCalendarRangeFromTransactionPreset,
  getMaxSelectableDate,
  validateTransactionDateRange,
  type TransactionPeriodPreset,
} from "@/lib/dateRange";

type TransactionDateRangeFilterProps = {
  preset: TransactionPeriodPreset;
  dateRange: RangeValue<DateValue>;
  onDateFilterChange: (
    preset: TransactionPeriodPreset,
    range: RangeValue<DateValue>,
  ) => void;
};

export function TransactionDateRangeFilter({
  preset,
  dateRange,
  onDateFilterChange,
}: TransactionDateRangeFilterProps) {
  const maxDate = getMaxSelectableDate();

  const applyPreset = (nextPreset: TransactionPeriodPreset) => {
    if (nextPreset === "custom") {
      onDateFilterChange("custom", dateRange);
      return;
    }

    const nextRange = getCalendarRangeFromTransactionPreset(nextPreset);
    onDateFilterChange(nextPreset, nextRange);
  };

  const handleDateRangeChange = (value: RangeValue<DateValue> | null) => {
    if (!value?.start || !value?.end) {
      return;
    }

    const error = validateTransactionDateRange(value);
    if (error) {
      return;
    }

    onDateFilterChange(detectTransactionPeriodPreset(value), value);
  };

  return (
    <DateRangePicker
      label="Zakres dat"
      value={dateRange}
      onChange={handleDateRangeChange}
      maxValue={maxDate}
      showMonthAndYearPickers
      validate={(value) => {
        const error = validateTransactionDateRange(value);
        return error ?? true;
      }}
      validationBehavior="aria"
      aria-label="Zakres dat"
      popoverProps={{
        classNames: {
          content: "p-0",
        },
      }}
      classNames={{
        popoverContent: "inline-flex max-w-none flex-row items-stretch p-0",
        calendarContent: "border-l border-default-200",
      }}
      CalendarTopContent={
        <div className="flex w-44 shrink-0 flex-col gap-0.5 p-2">
            {TRANSACTION_PERIOD_PRESETS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  preset === item.value
                    ? "bg-primary-100 font-medium text-primary"
                    : "text-default-600 hover:bg-default-100"
                }`}
                onClick={() => applyPreset(item.value)}
              >
                {item.label}
              </button>
            ))}
        </div>
      }
    />
  );
}
