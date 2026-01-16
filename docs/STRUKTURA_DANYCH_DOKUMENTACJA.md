# Opis Struktur Danych

## Tabela 18. Przedstawia opis struktury strony głównej

### balance (Dashboard)

| Pole | Typ | Opis |
|------|-----|------|
| totalIncome | number | Suma wszystkich wpływów w wybranym okresie |
| totalExpense | number | Suma wszystkich wydatków w wybranym okresie |
| balance | number | Bilans finansowy (totalIncome - totalExpense) |
| expensesByCategory | CategoryExpense[] | Tablica wydatków pogrupowanych według kategorii |
| monthlyData | MonthlyData[] | Dane porównawcze wpływów i wydatków w podziale na miesiące |

**Struktura CategoryExpense:**
- categoryId: string | null - Identyfikator kategorii
- categoryName: string - Nazwa kategorii
- total: number - Suma wydatków dla danej kategorii

**Struktura MonthlyData:**
- month: string - Miesiąc w formacie "YYYY-MM"
- income: number - Suma wpływów w danym miesiącu
- expense: number - Suma wydatków w danym miesiącu

---

## Tabela 19. Przedstawia opis struktury transaction

### transaction (Transakcja)

| Pole | Typ | Wymagane | Opis |
|------|-----|----------|------|
| id | string | Tak | Unikalny identyfikator transakcji (UUID) |
| amount | number | Tak | Kwota transakcji (musi być > 0) |
| type | "INCOME" \| "EXPENSE" | Tak | Typ transakcji: przychód lub wydatek |
| date | Date | Tak | Data transakcji (nie może być z przyszłości) |
| description | string \| null | Nie | Opcjonalny opis transakcji (max 500 znaków) |
| categoryId | string \| null | Nie | Identyfikator kategorii (referencja do categories.id) |
| createdAt | Date | Tak | Data utworzenia rekordu |
| updatedAt | Date | Tak | Data ostatniej modyfikacji |

**Relacje:**
- category: Relacja many-to-one z tabelą categories (onDelete: "set null")

**Walidacja:**
- amount: > 0
- date: <= dzisiaj
- description: max 500 znaków
- type: tylko "INCOME" lub "EXPENSE"

---

## Tabela 20. Przedstawia opis struktury category

### category (Kategoria)

| Pole | Typ | Wymagane | Opis |
|------|-----|----------|------|
| id | string | Tak | Unikalny identyfikator kategorii (UUID) |
| name | string | Tak | Nazwa kategorii (unikalna, 1-100 znaków) |
| createdAt | Date | Tak | Data utworzenia rekordu |
| updatedAt | Date | Tak | Data ostatniej modyfikacji |

**Relacje:**
- transactions: Relacja one-to-many z tabelą transactions

**Walidacja:**
- name: wymagane, 1-100 znaków, unikalne

**Przykładowe kategorie:**
- Jedzenie
- Transport
- Rozrywka
- Zdrowie
- Mieszkanie
- Edukacja
- Premia
- Inne

**Uwagi:**
- Przy usunięciu kategorii, powiązane transakcje otrzymują categoryId = null
- Kategorie są współdzielone między przychodami i wydatkami

---

## Tabela 21. Przedstawia opis struktury settings

### settings (Ustawienia)

| Pole | Typ | Wymagane | Wartość domyślna | Opis |
|------|-----|----------|------------------|------|
| id | string | Tak | "singleton" | Identyfikator (zawsze "singleton" - tylko jeden rekord) |
| currency | "PLN" \| "EUR" \| "USD" | Tak | "PLN" | Waluta wyświetlania |

**Typ Singleton:**
- Tabela zawiera dokładnie jeden rekord z id = "singleton"
- Służy do przechowywania globalnych ustawień aplikacji

**Dostępne waluty:**
- PLN - Polski złoty
- EUR - Euro
- USD - Dolar amerykański

**Formatowanie:**
- Waluta wpływa na formatowanie wszystkich kwot w aplikacji
- Wykorzystuje Intl.NumberFormat z locale "pl-PL"
- Wyświetla zawsze 2 miejsca po przecinku

**Przykład użycia:**
```typescript
// Pobranie ustawień
const settings = await getSettings();
// settings.currency -> "PLN"

// Aktualizacja waluty
await updateSettings("EUR");
```

---

## Dodatkowe struktury pomocnicze

### TransactionFilters (Filtry transakcji)

```typescript
{
  dateFrom?: Date,      // Data początkowa zakresu
  dateTo?: Date,        // Data końcowa zakresu
  type?: "INCOME" | "EXPENSE",  // Typ transakcji
  categoryId?: string   // Filtr po kategorii
}
```

### PeriodPreset (Presety okresów)

```typescript
type PeriodPreset = 
  | "current-month"      // Bieżący miesiąc
  | "previous-month"     // Poprzedni miesiąc
  | "last-3-months"      // Ostatnie 3 miesiące
  | "last-6-months"      // Ostatnie 6 miesięcy
  | "last-12-months"     // Ostatnie 12 miesięcy
  | "custom"             // Własny zakres dat
```

---

## Diagramy relacji

```
┌─────────────┐         ┌──────────────┐
│  categories │◄───────┤  transactions │
│             │ 1    * │              │
│ - id        │        │ - id         │
│ - name      │        │ - amount     │
│             │        │ - type       │
│             │        │ - date       │
│             │        │ - categoryId │
└─────────────┘        └──────────────┘

┌──────────┐
│ settings │ (singleton)
│          │
│ - id     │ (zawsze "singleton")
│ - currency│
└──────────┘
```

---

## Notatki implementacyjne

1. **Baza danych:** SQLite/libSQL z Drizzle ORM
2. **Identyfikatory:** Wszystkie ID generowane jako UUID (crypto.randomUUID())
3. **Daty:** Przechowywane jako timestamp w SQLite
4. **Cascade delete:** Przy usunięciu kategorii, categoryId w transakcjach = null
5. **Walidacja:** Dwupoziomowa (klient + serwer)
6. **Format dat:** ISO 8601 dla API, lokalne formatowanie w UI

