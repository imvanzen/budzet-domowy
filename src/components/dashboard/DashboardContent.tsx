"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import {
  SelectPeriod,
  getDateRangeFromPreset,
  type PeriodPreset,
} from "@/components/shared/SelectPeriod";
import { SummaryCards } from "./SummaryCards";
import { ExpensesPieChart } from "./ExpensesPieChart";
import { IncomeExpenseBarChart } from "./IncomeExpenseBarChart";
import { getDashboardData, type DashboardData } from "@/app/actions";
import type { Currency } from "@/db/schema";
import { formatDateInput } from "@/lib/format";

type DashboardContentProps = {
  initialData: DashboardData;
  currency: Currency;
};

export function DashboardContent({
  initialData,
  currency,
}: DashboardContentProps) {
  const [preset, setPreset] = useState<PeriodPreset>("current-month");
  const now = new Date();
  const [dateFrom, setDateFrom] = useState(
    formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1))
  );
  const [dateTo, setDateTo] = useState(formatDateInput(now));
  const [data, setData] = useState<DashboardData>(initialData);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = () => {
      startTransition(async () => {
        const { dateFrom: from, dateTo: to } = getDateRangeFromPreset(
          preset,
          dateFrom,
          dateTo
        );

        const newData = await getDashboardData({
          dateFrom: from,
          dateTo: to,
        });

        setData(newData);
      });
    };

    fetchData();
  }, [preset, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <SelectPeriod
            preset={preset}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onPresetChange={setPreset}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />
        </CardBody>
      </Card>

      {isPending && (
        <div className="text-center text-default-500">Ładowanie danych...</div>
      )}

      <div className={isPending ? "opacity-50" : ""}>
        <SummaryCards
          totalIncome={data.summary.totalIncome}
          totalExpense={data.summary.totalExpense}
          balance={data.summary.balance}
          currency={currency}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ExpensesPieChart
            data={data.expensesByCategory}
            currency={currency}
          />
          <IncomeExpenseBarChart data={data.monthlyData} currency={currency} />
        </div>
      </div>
    </div>
  );
}
