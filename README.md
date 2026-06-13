# Budżet Domowy

Aplikacja webowa do zarządzania finansami osobistymi — rejestrowanie przychodów i wydatków, kategoryzacja transakcji oraz analiza bilansu w wybranym okresie.

> Projekt zaliczeniowy z przedmiotu **Systemy Sieciowe** (WSTI).

## Informacje o projekcie

| | |
|---|---|
| **Autor** | Jakub Reczko |
| **Nr albumu** | 09224 |
| **E-mail** | jakub.reczko@edu.wsti.pl |
| **Przedmiot** | Systemy Sieciowe |

## Funkcjonalności

- Rejestracja transakcji (przychody i wydatki) z datą, kwotą, opisem i kategorią
- Zarządzanie kategoriami budżetowymi
- Analiza finansowa w wybranym okresie (tygodniowy, miesięczny, roczny)
- Wizualizacja danych — wykres kołowy struktury wydatków, wykres słupkowy przychodów i wydatków
- Filtrowanie transakcji po dacie, typie i kategorii
- Ustawienia — wybór waluty (PLN / EUR / USD)

## Widoki aplikacji

| Widok | Opis |
|---|---|
| **Dashboard** | Podsumowanie finansów z wykresami |
| **Transakcje** | Lista transakcji z filtrowaniem i paginacją |
| **Kategorie** | Tworzenie i edycja kategorii |
| **Ustawienia** | Konfiguracja waluty i motywu |

## Stos technologiczny

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **SQLite** + **Drizzle ORM**
- **HeroUI** + **Tailwind CSS 4**
- **Recharts** — wykresy
- **Vitest** + **Testing Library** — testy jednostkowe i integracyjne

## Uruchomienie

**Wymagania:** Node.js 20+, pnpm

```bash
# Instalacja zależności
pnpm install

# Konfiguracja bazy danych
cp .env.example .env.local

# Inicjalizacja schematu bazy
pnpm drizzle-kit push

# Dane przykładowe (opcjonalnie)
pnpm seed

# Serwer deweloperski
pnpm dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000)

## Testy

```bash
pnpm test        # tryb watch
pnpm test:run    # jednorazowe uruchomienie
pnpm lint        # Biome — lint i format
```

## Struktura projektu

```
src/
├── app/                  # Routing (App Router), Server Actions
│   ├── page.tsx          # Dashboard
│   ├── transactions/     # Lista, dodawanie, edycja transakcji
│   ├── categories/       # Zarządzanie kategoriami
│   └── settings/         # Ustawienia aplikacji
├── components/           # Komponenty React (UI)
├── services/             # Logika dostępu do bazy danych
├── db/                   # Schemat Drizzle, połączenie z SQLite
├── lib/                  # Funkcje pomocnicze (formatowanie, daty)
├── types/                # Wspólne typy TypeScript
└── hooks/                # Hooki React
scripts/                  # Skrypty seedowania bazy
```

## Architektura

Warstwy aplikacji:

1. **`app/`** — strony Next.js i Server Actions (walidacja, revalidacja cache)
2. **`services/`** — operacje na bazie danych (CRUD, agregacje, raporty)
3. **`components/`** — interfejs użytkownika (Server i Client Components)
