import { today, getLocalTimeZone, CalendarDate, type DateValue } from "@internationalized/date";
import type { RangeValue } from "@react-types/shared";

export type PeriodPreset =
  | "current-month"
  | "previous-month"
  | "last-3-months"
  | "last-6-months"
  | "last-12-months"
  | "custom";

export type TransactionPeriodPreset =
  | "current-month"
  | "previous-month"
  | "current-year"
  | "previous-year"
  | "custom";

export const DEFAULT_TRANSACTION_PERIOD_PRESET: TransactionPeriodPreset =
  "current-year";

export const TRANSACTION_PERIOD_PRESETS: Array<{
  value: TransactionPeriodPreset;
  label: string;
}> = [
  { value: "current-month", label: "Ten miesiąc" },
  { value: "previous-month", label: "Ostatni miesiąc" },
  { value: "current-year", label: "Ten rok" },
  { value: "previous-year", label: "Ostatni rok" },
  { value: "custom", label: "Własny zakres" },
];

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function endOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function parseDateInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getDateRangeFromPreset(
  preset: PeriodPreset,
  customFrom?: string,
  customTo?: string,
  referenceDate: Date = new Date(),
): { dateFrom: Date; dateTo: Date } {
  const now = referenceDate;
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (preset) {
    case "current-month": {
      const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      return { dateFrom: start, dateTo: todayEnd };
    }
    case "previous-month": {
      const start = startOfDay(
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
      );
      const end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      return { dateFrom: start, dateTo: end };
    }
    case "last-3-months": {
      const start = startOfDay(
        new Date(now.getFullYear(), now.getMonth() - 2, 1),
      );
      return { dateFrom: start, dateTo: todayEnd };
    }
    case "last-6-months": {
      const start = startOfDay(
        new Date(now.getFullYear(), now.getMonth() - 5, 1),
      );
      return { dateFrom: start, dateTo: todayEnd };
    }
    case "last-12-months": {
      const start = startOfDay(
        new Date(now.getFullYear(), now.getMonth() - 11, 1),
      );
      return { dateFrom: start, dateTo: todayEnd };
    }
    case "custom": {
      const from = customFrom ? parseDateInput(customFrom) : todayStart;
      const to = customTo ? parseDateInput(customTo) : todayStart;
      return { dateFrom: startOfDay(from), dateTo: endOfDay(to) };
    }
    default:
      return { dateFrom: todayStart, dateTo: todayEnd };
  }
}

function formatCalendarDateParam(value: DateValue): string {
  const month = String(value.month).padStart(2, "0");
  const day = String(value.day).padStart(2, "0");
  return `${value.year}-${month}-${day}`;
}

export function getTransactionDateRangeFromPreset(
  preset: TransactionPeriodPreset,
  customFrom?: string,
  customTo?: string,
  referenceDate: Date = new Date(),
): { dateFrom: Date; dateTo: Date } {
  const now = referenceDate;
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (preset) {
    case "current-month": {
      const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      return { dateFrom: start, dateTo: todayEnd };
    }
    case "previous-month": {
      const start = startOfDay(
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
      );
      const end = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      return { dateFrom: start, dateTo: end };
    }
    case "current-year": {
      const start = startOfDay(new Date(now.getFullYear(), 0, 1));
      return { dateFrom: start, dateTo: todayEnd };
    }
    case "previous-year": {
      const year = now.getFullYear() - 1;
      const start = startOfDay(new Date(year, 0, 1));
      const end = endOfDay(new Date(year, 11, 31));
      return { dateFrom: start, dateTo: end };
    }
    case "custom": {
      const from = customFrom ? parseDateInput(customFrom) : todayStart;
      const to = customTo ? parseDateInput(customTo) : todayStart;
      return { dateFrom: startOfDay(from), dateTo: endOfDay(to) };
    }
    default:
      return { dateFrom: todayStart, dateTo: todayEnd };
  }
}

export function getCalendarRangeFromTransactionPreset(
  preset: TransactionPeriodPreset,
  customRange?: RangeValue<DateValue> | null,
  referenceDate: Date = new Date(),
): RangeValue<DateValue> {
  if (preset === "custom" && customRange?.start && customRange?.end) {
    return customRange;
  }

  const { dateFrom, dateTo } = getTransactionDateRangeFromPreset(
    preset,
    customRange?.start
      ? formatCalendarDateParam(customRange.start)
      : undefined,
    customRange?.end ? formatCalendarDateParam(customRange.end) : undefined,
    referenceDate,
  );

  return {
    start: dateToCalendarDate(dateFrom),
    end: dateToCalendarDate(dateTo),
  };
}

export function getDefaultTransactionDateRange(
  referenceDate: Date = new Date(),
): RangeValue<DateValue> {
  return getCalendarRangeFromTransactionPreset(
    DEFAULT_TRANSACTION_PERIOD_PRESET,
    null,
    referenceDate,
  );
}

export function detectTransactionPeriodPreset(
  range: RangeValue<DateValue>,
  referenceDate: Date = new Date(),
): TransactionPeriodPreset {
  const rangeKey = `${formatCalendarDateParam(range.start)}:${formatCalendarDateParam(range.end)}`;

  for (const preset of TRANSACTION_PERIOD_PRESETS) {
    if (preset.value === "custom") continue;

    const presetRange = getCalendarRangeFromTransactionPreset(
      preset.value,
      null,
      referenceDate,
    );
    const presetKey = `${formatCalendarDateParam(presetRange.start)}:${formatCalendarDateParam(presetRange.end)}`;

    if (rangeKey === presetKey) {
      return preset.value;
    }
  }

  return "custom";
}

export function validateTransactionDateRange(
  value: RangeValue<DateValue> | null
): string | null {
  if (!value?.start || !value?.end) {
    return null;
  }

  const maxDate = today(getLocalTimeZone());

  if (value.start.compare(maxDate) > 0 || value.end.compare(maxDate) > 0) {
    return "Data nie może być z przyszłości";
  }

  if (value.start.compare(value.end) > 0) {
    return "Data początkowa nie może być późniejsza niż data końcowa";
  }

  return null;
}

export function calendarDateRangeToDates(
  value: RangeValue<DateValue>
): { dateFrom: Date; dateTo: Date } {
  const dateFrom = startOfDay(
    new Date(value.start.year, value.start.month - 1, value.start.day),
  );
  const dateTo = endOfDay(
    new Date(value.end.year, value.end.month - 1, value.end.day),
  );

  return { dateFrom, dateTo };
}

export function getMaxSelectableDate(): DateValue {
  return today(getLocalTimeZone());
}

export function calendarDateToDate(value: DateValue): Date {
  return new Date(value.year, value.month - 1, value.day);
}

export function dateToCalendarDate(date: Date): DateValue {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}
