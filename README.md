# Budżet Domowy

System zarządzania budżetem domowym - aplikacja webowa do śledzenia przychodów i wydatków.

## Funkcjonalności

- ✅ **Dashboard** - podsumowanie finansów z wykresami
- ✅ **Transakcje** - dodawanie, edycja i usuwanie transakcji (przychody/wydatki)
- ✅ **Kategorie** - zarządzanie kategoriami transakcji
- ✅ **Filtry** - filtrowanie transakcji po dacie, typie i kategorii
- ✅ **Wykresy** - wizualizacja wydatków i przychodów
- ✅ **Ustawienia** - wybór waluty (PLN/EUR/USD)

## Technologie

- **Next.js 16** - React framework z App Router
- **React 19** - UI library
- **TypeScript** - type safety
- **HeroUI** - komponenty UI
- **TailwindCSS** - styling
- **Drizzle ORM** - database ORM
- **SQLite/libSQL** - lokalna baza danych
- **Vitest** - unit & integration testing
- **Playwright** - E2E testing

## Instalacja

```bash
# Instalacja zależności
pnpm install

# Konfiguracja bazy danych
# Utwórz plik .env.local z:
# DB_FILE_NAME=file:./local.db

# Inicjalizacja bazy danych
pnpm drizzle-kit push

# Załadowanie danych testowych
pnpm seed
```

## Uruchomienie

```bash
# Development server
pnpm dev

# Production build
pnpm build
pnpm start
```

Aplikacja dostępna pod [http://localhost:3000](http://localhost:3000)

## Testy

```bash
# Unit & Integration tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## Struktura projektu

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Dashboard
│   ├── transactions/      # Strona transakcji
│   ├── categories/        # Strona kategorii
│   └── settings/          # Strona ustawień
├── components/            # React components
│   ├── dashboard/         # Komponenty dashboardu
│   ├── transactions/      # Komponenty transakcji
│   ├── categories/        # Komponenty kategorii
│   ├── settings/          # Komponenty ustawień
│   ├── shared/            # Współdzielone komponenty
│   └── layout/            # Layout components
├── services/              # Business logic
├── db/                    # Database schema & client
├── lib/                   # Utilities
└── hooks/                 # Custom React hooks
```

## Dokumentacja

Szczegółowa dokumentacja dostępna w katalogu `docs/`:

- `POC_PLAN.md` - plan projektu i user stories
- `VIEWS_DESCRIPTION.md` - opis widoków aplikacji
- `TESTING_GUIDELINES.md` - wytyczne testowania
- `DOCUMENTATION_TODO.md` - lista zadań dokumentacyjnych

## Licencja

Projekt edukacyjny
