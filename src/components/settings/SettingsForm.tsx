"use client";

import { useState, useTransition } from "react";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { changeCurrency } from "@/app/settings/actions";
import type { Currency } from "@/db/schema";

type SettingsFormProps = {
  initialCurrency: Currency;
};

const CURRENCIES: Array<{ value: Currency; label: string }> = [
  { value: "PLN", label: "PLN - Polski złoty" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "USD", label: "USD - Dolar amerykański" },
];

export function SettingsForm({ initialCurrency }: SettingsFormProps) {
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await changeCurrency(currency);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Waluta domyślna"
        selectedKeys={[currency]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as Currency;
          setCurrency(selected);
        }}
        description="Wybrana waluta będzie używana do formatowania wszystkich kwot w aplikacji"
      >
        {CURRENCIES.map((curr) => (
          <SelectItem key={curr.value}>{curr.label}</SelectItem>
        ))}
      </Select>

      {error && (
        <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-50 p-3 text-sm text-success">
          Ustawienia zostały zapisane!
        </div>
      )}

      <Button type="submit" color="primary" isLoading={isPending} isDisabled={currency === initialCurrency}>
        {isPending ? "Zapisywanie..." : "Zapisz"}
      </Button>
    </form>
  );
}

