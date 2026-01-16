"use client";

import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";

export type PeriodPreset =
  | "current-month"
  | "previous-month"
  | "last-3-months"
  | "last-6-months"
  | "last-12-months"
  | "custom";

type SelectPeriodProps = {
  preset: PeriodPreset;
  dateFrom?: string;
  dateTo?: string;
  onPresetChange: (preset: PeriodPreset) => void;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
};

const PRESETS: Array<{ value: PeriodPreset; label: string }> = [
  { value: "current-month", label: "Bieżący miesiąc" },
  { value: "previous-month", label: "Poprzedni miesiąc" },
  { value: "last-3-months", label: "Ostatnie 3 miesiące" },
  { value: "last-6-months", label: "Ostatnie 6 miesięcy" },
  { value: "last-12-months", label: "Ostatnie 12 miesięcy" },
  { value: "custom", label: "Własny zakres" },
];

export function SelectPeriod({
  preset,
  dateFrom,
  dateTo,
  onPresetChange,
  onDateFromChange,
  onDateToChange,
}: SelectPeriodProps) {
  return (
    <div className="space-y-4">
      <Select
        label="Wybór daty"
        selectedKeys={[preset]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as PeriodPreset;
          onPresetChange(selected);
        }}
      >
        {PRESETS.map((p) => (
          <SelectItem key={p.value}>{p.label}</SelectItem>
        ))}
      </Select>

      {preset === "custom" && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Od"
            value={dateFrom}
            onValueChange={onDateFromChange}
          />
          <Input
            type="date"
            label="Do"
            value={dateTo}
            onValueChange={onDateToChange}
          />
        </div>
      )}
    </div>
  );
}

export function getDateRangeFromPreset(
  preset: PeriodPreset,
  customFrom?: string,
  customTo?: string
): { dateFrom: Date; dateTo: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "current-month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { dateFrom: start, dateTo: end };
    }
    case "previous-month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { dateFrom: start, dateTo: end };
    }
    case "last-3-months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { dateFrom: start, dateTo: today };
    }
    case "last-6-months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return { dateFrom: start, dateTo: today };
    }
    case "last-12-months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      return { dateFrom: start, dateTo: today };
    }
    case "custom": {
      const from = customFrom ? new Date(customFrom) : today;
      const to = customTo ? new Date(customTo) : today;
      return { dateFrom: from, dateTo: to };
    }
    default:
      return { dateFrom: today, dateTo: today };
  }
}

