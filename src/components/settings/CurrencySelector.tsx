"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectItem } from "@heroui/select";
import { HiCurrencyDollar } from "react-icons/hi2";
import { changeCurrency } from "@/app/settings/actions";
import { showSyncToast } from "@/lib/sync-toast";
import type { Currency } from "@/db/schema";

type CurrencySelectorProps = {
  initialCurrency: Currency;
};

const CURRENCIES: Array<{ value: Currency; label: string }> = [
  { value: "PLN", label: "PLN - Polski złoty" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "USD", label: "USD - Dolar amerykański" },
];

export function CurrencySelector({ initialCurrency }: CurrencySelectorProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimisticCurrency, setOptimisticCurrency] = useOptimistic(
    initialCurrency,
    (_current, newCurrency: Currency) => newCurrency,
  );

  const handleCurrencyChange = (keys: "all" | Set<React.Key>) => {
    const selected = Array.from(keys)[0] as Currency | undefined;
    if (!selected || selected === optimisticCurrency) return;

    startTransition(async () => {
      setOptimisticCurrency(selected);

      await showSyncToast(
        async () => {
          const result = await changeCurrency(selected);
          if (!result.success) {
            throw new Error(result.error);
          }
          router.refresh();
          return result;
        },
        {
          loading: "Zapisywanie waluty...",
          success: "Waluta została zapisana",
          error: "Nie udało się zapisać waluty",
        },
      );
    });
  };

  return (
    <Select
      label="Waluta domyślna"
      selectedKeys={[optimisticCurrency]}
      onSelectionChange={handleCurrencyChange}
      startContent={<HiCurrencyDollar className="text-success" aria-hidden />}
      description="Wybrana waluta będzie używana do formatowania wszystkich kwot w aplikacji"
    >
      {CURRENCIES.map((curr) => (
        <SelectItem key={curr.value}>{curr.label}</SelectItem>
      ))}
    </Select>
  );
}
