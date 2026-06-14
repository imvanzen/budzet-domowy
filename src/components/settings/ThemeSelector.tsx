"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Select, SelectItem } from "@heroui/select";
import { HiSun, HiMoon, HiComputerDesktop } from "react-icons/hi2";
import { showSuccessToast } from "@/lib/sync-toast";

const THEMES = [
  { value: "light", label: "Jasny", icon: HiSun },
  { value: "dark", label: "Ciemny", icon: HiMoon },
  { value: "system", label: "Systemowy", icon: HiComputerDesktop },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Select label="Motyw" isDisabled selectedKeys={["system"]}>
        <SelectItem key="system">Systemowy</SelectItem>
      </Select>
    );
  }

  return (
    <Select
      label="Motyw"
      selectedKeys={[theme ?? "system"]}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as string;
        if (!selected || selected === theme) return;
        setTheme(selected);
        showSuccessToast("Motyw został zmieniony");
      }}
      description="Wybierz jasny, ciemny lub tryb zgodny z ustawieniami systemu"
    >
      {THEMES.map((t) => {
        const Icon = t.icon;
        return (
          <SelectItem key={t.value} startContent={<Icon className="text-lg" aria-hidden />}>
            {t.label}
          </SelectItem>
        );
      })}
    </Select>
  );
}
