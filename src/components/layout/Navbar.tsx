"use client";

import { Navbar as HeroNavbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Link } from "@heroui/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <HeroNavbar isBordered>
      <NavbarBrand>
        <Link href="/" color="foreground">
          <p className="text-xl font-bold">Budżet Domowy</p>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        <NavbarItem isActive={isActive("/")}>
          <Link color={isActive("/") ? "primary" : "foreground"} href="/">
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActive("/transactions")}>
          <Link
            color={isActive("/transactions") ? "primary" : "foreground"}
            href="/transactions"
          >
            Transakcje
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActive("/categories")}>
          <Link
            color={isActive("/categories") ? "primary" : "foreground"}
            href="/categories"
          >
            Kategorie
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActive("/settings")}>
          <Link
            color={isActive("/settings") ? "primary" : "foreground"}
            href="/settings"
          >
            Ustawienia
          </Link>
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
}

