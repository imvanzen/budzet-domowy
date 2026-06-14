import { Card, CardBody } from "@heroui/card";
import {
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiScale,
} from "react-icons/hi2";
import { formatCurrency } from "@/lib/format";
import type { Currency } from "@/db/schema";

type SummaryCardsProps = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  currency: Currency;
};

export function SummaryCards({
  totalIncome,
  totalExpense,
  balance,
  currency,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="rounded-full bg-success-100 p-3 dark:bg-success-900/30">
            <HiArrowTrendingUp className="text-2xl text-success" aria-hidden />
          </div>
          <div>
            <p className="text-sm text-default-500">Wpływy</p>
            <p className="mt-1 text-2xl font-bold text-success">
              {formatCurrency(totalIncome, currency)}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex items-center gap-4">
          <div className="rounded-full bg-danger-100 p-3 dark:bg-danger-900/30">
            <HiArrowTrendingDown className="text-2xl text-danger" aria-hidden />
          </div>
          <div>
            <p className="text-sm text-default-500">Wydatki</p>
            <p className="mt-1 text-2xl font-bold text-danger">
              {formatCurrency(totalExpense, currency)}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex items-center gap-4">
          <div
            className={`rounded-full p-3 ${
              balance >= 0
                ? "bg-success-100 dark:bg-success-900/30"
                : "bg-danger-100 dark:bg-danger-900/30"
            }`}
          >
            <HiScale
              className={`text-2xl ${balance >= 0 ? "text-success" : "text-danger"}`}
              aria-hidden
            />
          </div>
          <div>
            <p className="text-sm text-default-500">Balans</p>
            <p
              className={`mt-1 text-2xl font-bold ${
                balance >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {formatCurrency(balance, currency)}
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

