"use client";

import { Card, CardBody } from "@heroui/card";
import { useEffect, useState, useTransition } from "react";
import { type DashboardData, getDashboardData } from "@/app/actions";
import { type PeriodPreset, SelectPeriod } from "@/components/shared/SelectPeriod";
import { DashboardChartsSkeleton } from "@/components/skeletons/DashboardChartsSkeleton";
import { SummaryCardsSkeleton } from "@/components/skeletons/SummaryCardsSkeleton";
import type { Currency } from "@/db/schema";
import { getDateRangeFromPreset } from "@/lib/dateRange";
import { formatDateInput } from "@/lib/format";
import { ExpensesPieChart } from "./ExpensesPieChart";
import { IncomeExpenseBarChart } from "./IncomeExpenseBarChart";
import { SummaryCards } from "./SummaryCards";

type DashboardContentProps = {
  initialData: DashboardData;
  currency: Currency;
};

export function DashboardContent({ initialData, currency }: DashboardContentProps) {
  const [preset, setPreset] = useState<PeriodPreset>("current-month");
  const now = new Date();
  const [dateFrom, setDateFrom] = useState(
    formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
  );
  const [dateTo, setDateTo] = useState(formatDateInput(now));
  const [data, setData] = useState<DashboardData>(initialData);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = () => {
      startTransition(async () => {
        const { dateFrom: from, dateTo: to } = getDateRangeFromPreset(preset, dateFrom, dateTo);

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

      {isPending ? (
        <>
          <SummaryCardsSkeleton />
          <DashboardChartsSkeleton />
        </>
      ) : (
        <>
          <SummaryCards
            totalIncome={data.summary.totalIncome}
            totalExpense={data.summary.totalExpense}
            balance={data.summary.balance}
            currency={currency}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ExpensesPieChart data={data.expensesByCategory} currency={currency} />
            <IncomeExpenseBarChart data={data.monthlyData} currency={currency} />
          </div>
        </>
      )}
    </div>
  );
}
