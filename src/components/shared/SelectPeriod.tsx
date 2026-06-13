"use client";

import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import type { PeriodPreset } from "@/lib/dateRange";

export type { PeriodPreset };

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

