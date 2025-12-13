"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider, useTheme } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </ThemeProvider>
    </HeroUIProvider>
  );
}
