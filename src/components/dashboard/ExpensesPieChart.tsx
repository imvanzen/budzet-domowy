"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";
import type { Currency } from "@/db/schema";
import type { CategoryExpense } from "@/services/transactions";

type ExpensesPieChartProps = {
  data: CategoryExpense[];
  currency: Currency;
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0",
  "#a4de6c",
];

export function ExpensesPieChart({ data, currency }: ExpensesPieChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Wydatki wg kategorii</h3>
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
    name: item.categoryName,
    value: item.total,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-default-200 bg-background p-2 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-primary">
            {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Wydatki wg kategorii</h3>
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
