import { today, getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "@react-types/datepicker";
import type { RangeValue } from "@react-types/shared";

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
