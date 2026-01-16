"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/format";
import type { Currency } from "@/db/schema";
import type { MonthlyData } from "@/services/transactions";

type IncomeExpenseBarChartProps = {
  data: MonthlyData[];
  currency: Currency;
};

export function IncomeExpenseBarChart({ data, currency }: IncomeExpenseBarChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Wpływy i Wydatki</h3>
        </CardHeader>
        <CardBody>
          <div className="flex h-80 items-center justify-center">
            <p className="text-center text-default-500">Brak danych do wyświetlenia</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    month: item.month,
    Wpływy: item.income,
    Wydatki: item.expense,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-default-200 bg-background p-3 shadow-lg">
          <p className="mb-2 font-semibold">{payload[0].payload.month}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {formatCurrency(item.value, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Wpływy i Wydatki</h3>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value, currency)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Wpływy" fill="#10b981" />
            <Bar dataKey="Wydatki" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
