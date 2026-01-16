"use server";

import { getSummary, getExpensesByCategory, getMonthlyComparison } from "@/services/transactions";
import type { SummaryData, CategoryExpense, MonthlyData, TransactionFilters } from "@/services/transactions";

export type DashboardData = {
  summary: SummaryData;
  expensesByCategory: CategoryExpense[];
  monthlyData: MonthlyData[];
};

export async function getDashboardData(filters?: TransactionFilters): Promise<DashboardData> {
  const [summary, expensesByCategory, monthlyData] = await Promise.all([
    getSummary(filters),
    getExpensesByCategory(filters),
    getMonthlyComparison(filters),
  ]);

  return {
    summary,
    expensesByCategory,
    monthlyData,
  };
}

