import { today, getLocalTimeZone, CalendarDate, type DateValue } from "@internationalized/date";
import type { RangeValue } from "@react-types/shared";

export type PeriodPreset =
  | "current-month"
  | "previous-month"
  | "last-3-months"
  | "last-6-months"
  | "last-12-months"
  | "custom";

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
