import { Card, CardBody } from "@heroui/card";
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
        <CardBody className="text-center">
          <p className="text-sm text-default-500">Wpływy</p>
          <p className="mt-2 text-2xl font-bold text-success">
            {formatCurrency(totalIncome, currency)}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="text-center">
          <p className="text-sm text-default-500">Wydatki</p>
          <p className="mt-2 text-2xl font-bold text-danger">
            {formatCurrency(totalExpense, currency)}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="text-center">
          <p className="text-sm text-default-500">Balans</p>
          <p
            className={`mt-2 text-2xl font-bold ${
              balance >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatCurrency(balance, currency)}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

