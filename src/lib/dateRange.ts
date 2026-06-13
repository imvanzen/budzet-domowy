import { today, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "@react-types/datepicker";
import type { RangeValue } from "@react-types/shared";

export type PeriodPreset =
  | "current-month"
  | "previous-month"
  | "last-3-months"
  | "last-6-months"
  | "last-12-months"
  | "custom";

export function getDateRangeFromPreset(
  preset: PeriodPreset,
  customFrom?: string,
  customTo?: string,
): { dateFrom: Date; dateTo: Date } {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
      return { dateFrom: start, dateTo: todayDate };
    }
    case "last-6-months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return { dateFrom: start, dateTo: todayDate };
    }
    case "last-12-months": {
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      return { dateFrom: start, dateTo: todayDate };
    }
    case "custom": {
      const from = customFrom ? new Date(customFrom) : todayDate;
      const to = customTo ? new Date(customTo) : todayDate;
      return { dateFrom: from, dateTo: to };
    }
    default:
      return { dateFrom: todayDate, dateTo: todayDate };
  }
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
  const dateFrom = new Date(value.start.year, value.start.month - 1, value.start.day);
  const dateTo = new Date(value.end.year, value.end.month - 1, value.end.day, 23, 59, 59, 999);

  return { dateFrom, dateTo };
}

export function getMaxSelectableDate(): DateValue {
  return today(getLocalTimeZone());
}
