# System Zarządzania Budżetem Domowym

Prosty, intuicyjny system do zarządzania budżetem domowym. Aplikacja webowa umożliwiająca rejestrowanie transakcji finansowych, klasyfikowanie ich według kategorii oraz analizę przepływów finansowych w wybranych okresach.

## Funkcjonalności

- **Rejestracja transakcji** - wprowadzanie przychodów i wydatków z datą, kwotą, opisem i kategorią
- **Zarządzanie kategoriami** - tworzenie i edycja kategorii budżetowych
- **Analiza finansowa** - obliczanie bilansu w wybranych okresach (tygodniowy, miesięczny, roczny)
- **Wizualizacja danych** - wykresy słupkowe i kołowe prezentujące strukturę wydatków i przychodów
- **Filtrowanie** - filtrowanie transakcji po dacie, typie i kategorii
- **Ustawienia** - wybór waluty (PLN/EUR/USD)

## Technologie

- Next.js 16 (App Router)
- React 19
- TypeScript
- Drizzle ORM
- SQLite (lokalna baza danych)
- Vitest (testy jednostkowe i integracyjne)

## Instalacja i uruchomienie

```bash
# Instalacja zależności
pnpm install

# Konfiguracja bazy danych
# Utwórz plik .env.local z: DB_FILE_NAME=file:./local.db

# Inicjalizacja bazy danych
pnpm drizzle-kit push

# Załadowanie danych testowych
pnpm seed

# Uruchomienie serwera deweloperskiego
pnpm dev
```

Aplikacja dostępna pod [http://localhost:3000](http://localhost:3000)

## Testy

```bash
# Testy jednostkowe i integracyjne
pnpm test
```

## Dokumentacja

Szczegółowa dokumentacja projektu dostępna w pliku `docs/Jakub_Reczko_5ION1_Projekt_Zarzadzania_Budżetem_Domowym.pdf`
