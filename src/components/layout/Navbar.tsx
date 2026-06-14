"use client";

import { Navbar as HeroNavbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Link } from "@heroui/link";
import { usePathname } from "next/navigation";
import { HiHome, HiArrowsRightLeft, HiTag, HiCog6Tooth, HiWallet } from "react-icons/hi2";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    path === "/" ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <HeroNavbar isBordered>
      <NavbarBrand>
        <Link href="/" color="foreground" className="flex items-center gap-2">
          <HiWallet className="text-2xl text-primary" aria-hidden />
          <p className="text-xl font-bold">Budżet Domowy</p>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        <NavbarItem isActive={isActive("/")}>
          <Link
            color={isActive("/") ? "primary" : "foreground"}
            href="/"
            className="flex items-center gap-1.5"
          >
            <HiHome className="text-lg" aria-hidden />
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActive("/transactions")}>
          <Link
            color={isActive("/transactions") ? "primary" : "foreground"}
            href="/transactions"
            className="flex items-center gap-1.5"
          >
            <HiArrowsRightLeft className="text-lg" aria-hidden />
            Transakcje
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActive("/categories")}>
          <Link
            color={isActive("/categories") ? "primary" : "foreground"}
            href="/categories"
            className="flex items-center gap-1.5"
          >
            <HiTag className="text-lg" aria-hidden />
            Kategorie
          </Link>
        </NavbarItem>
        <NavbarItem isActive={isActive("/settings")}>
          <Link
            color={isActive("/settings") ? "primary" : "foreground"}
            href="/settings"
            className="flex items-center gap-1.5"
          >
            <HiCog6Tooth className="text-lg" aria-hidden />
            Ustawienia
          </Link>
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
}
