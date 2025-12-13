# System Zarządzania Budżetem Domowym – PoC Plan

## 1. Business Goals

| ID   | Cel biznesowy                                                                                                |
| ---- | ------------------------------------------------------------------------------------------------------------ |
| BG-1 | Umożliwić użytkownikowi rejestrowanie transakcji przychodów i wydatków w prosty, intuicyjny sposób.          |
| BG-2 | Zapewnić kategoryzację transakcji dla lepszej analizy struktury finansów domowych.                           |
| BG-3 | Dostarczyć czytelne podsumowania okresowe (bilans, sumy przychodów/wydatków).                                |
| BG-4 | Wizualizować dane finansowe za pomocą wykresów (kołowy, słupkowy) dla szybkiego wglądu w sytuację budżetową. |
| BG-5 | Umożliwić filtrowanie transakcji po dacie, kategorii i typie dla łatwego wyszukiwania.                       |
| BG-6 | Przechowywać dane lokalnie (SQLite) bez konieczności zakładania konta i logowania.                           |
| BG-7 | Zapewnić konfigurowalny format waluty (PLN/EUR/USD) dla poprawnego wyświetlania kwot.                        |

---

## 2. User Stories + Acceptance Criteria

### ✅ US-1: Dodawanie transakcji

**Jako** użytkownik **chcę** dodać nową transakcję (przychód lub wydatek) **aby** rejestrować swoje finanse.

**Acceptance Criteria:**

1. ✅ Formularz zawiera pola: kwota, typ (income/expense), data, kategoria (opcjonalna), opis (opcjonalny).
2. ✅ Kwota musi być > 0.
3. ✅ Data nie może być z przyszłości.
4. ✅ Po zapisie transakcja pojawia się na liście.
5. ✅ Wyświetla się komunikat sukcesu.

---

### US-2: Edycja transakcji

**Jako** użytkownik **chcę** edytować istniejącą transakcję **aby** poprawić błędne dane.

**Acceptance Criteria:**

1. Mogę otworzyć formularz edycji z wypełnionymi danymi.
2. Walidacja działa tak samo jak przy dodawaniu.
3. Po zapisie lista odświeża się z nowymi danymi.

---

### US-3: Usuwanie transakcji

**Jako** użytkownik **chcę** usunąć transakcję **aby** skorygować błędnie dodane wpisy.

**Acceptance Criteria:**

1. Przed usunięciem wyświetla się modal potwierdzenia.
2. Po usunięciu transakcja znika z listy.
3. Podsumowania i wykresy aktualizują się.

---

### US-4: Lista transakcji z filtrowaniem

**Jako** użytkownik **chcę** przeglądać listę transakcji z możliwością filtrowania **aby** szybko znaleźć konkretne wpisy.

**Acceptance Criteria:**

1. Lista pokazuje: datę, typ (ikona/kolor), kwotę, kategorię, opis.
2. Filtry: zakres dat (preset + custom), typ (income/expense/all), kategoria.
3. Lista sortowana domyślnie po dacie malejąco.
4. Przy braku wyników wyświetla się komunikat "Brak transakcji".

---

### US-5: Zarządzanie kategoriami (CRUD)

**Jako** użytkownik **chcę** tworzyć, edytować i usuwać kategorie **aby** dostosować system do moich potrzeb.

**Acceptance Criteria:**

1. Mogę dodać kategorię z nazwą (wymagana, unikalna).
2. Mogę edytować nazwę istniejącej kategorii.
3. Przy usuwaniu kategorii z przypisanymi transakcjami – transakcje tracą kategorię (null).
4. Nie mogę usunąć kategorii "Uncategorized" (jeśli istnieje jako domyślna).

---

### US-6: Dashboard z podsumowaniem

**Jako** użytkownik **chcę** widzieć dashboard z podsumowaniem **aby** mieć szybki wgląd w stan finansów.

**Acceptance Criteria:**

1. Wyświetla: całkowite przychody, całkowite wydatki, bilans (przychody - wydatki).
2. Dane dotyczą wybranego okresu (komponent Select Period).
3. Wartości formatowane wg wybranej waluty.

---

### US-7: Wykres kołowy wydatków

**Jako** użytkownik **chcę** widzieć wykres kołowy wydatków wg kategorii **aby** zrozumieć strukturę wydatków.

**Acceptance Criteria:**

1. Wykres pokazuje % udziału każdej kategorii w wydatkach.
2. Dotyczy wybranego okresu.
3. Kategorie bez wydatków nie są pokazywane.
4. Przy braku danych: komunikat "Brak danych do wyświetlenia".

---

### US-8: Wykres słupkowy przychody vs wydatki

**Jako** użytkownik **chcę** widzieć wykres słupkowy porównujący przychody i wydatki per miesiąc **aby** śledzić trendy.

**Acceptance Criteria:**

1. Oś X: miesiące w wybranym zakresie.
2. Dwa słupki na miesiąc: przychody (zielony), wydatki (czerwony).
3. Przy braku danych za miesiąc: słupki = 0.

---

### US-9: Wybór okresu (Select Period)

**Jako** użytkownik **chcę** wybierać okres analizy **aby** przeglądać dane z różnych przedziałów czasowych.

**Acceptance Criteria:**

1. Presety: Bieżący miesiąc, Poprzedni miesiąc, Ostatnie 3 miesiące, Ostatnie 6 miesięcy, Ostatnie 12 miesięcy.
2. Custom: date picker od-do.
3. Wybrany okres stosuje się do dashboardu, wykresów i listy transakcji.

---

### US-10: Ustawienia waluty

**Jako** użytkownik **chcę** wybrać walutę wyświetlania **aby** kwoty były formatowane zgodnie z moimi preferencjami.

**Acceptance Criteria:**

1. Dostępne waluty: PLN, EUR, USD.
2. Zmiana waluty wpływa na formatowanie kwot w całej aplikacji.
3. Domyślnie: PLN.

---

## 3. Zakres PoC

### ✅ In Scope (PoC MVP)

| #   | Feature                                                                        |
| --- | ------------------------------------------------------------------------------ |
| 1   | 🔄 CRUD transakcji (income/expense) - Create ✅, Read ✅, Update ⏳, Delete ⏳ |
| 2   | CRUD kategorii (wspólne dla income/expense)                                    |
| 3   | Lista transakcji z filtrowaniem (data, typ, kategoria)                         |
| 4   | Dashboard z podsumowaniem (przychody, wydatki, bilans)                         |
| 5   | Wykres kołowy wydatków wg kategorii                                            |
| 6   | Wykres słupkowy przychody vs wydatki per miesiąc                               |
| 7   | Komponent Select Period (presety + custom range)                               |
| 8   | Ustawienia waluty (PLN/EUR/USD) – tylko formatowanie                           |
| 9   | ✅ Walidacja danych (kwota > 0, data ≤ dziś)                                   |
| 10  | ✅ Persystencja w SQLite/libSQL via Drizzle                                    |
| 11  | ✅ UI w Next.js + HeroUI + TailwindCSS                                         |
| 12  | Wykresy via Recharts                                                           |

### ❌ Out of Scope

| #   | Feature                                             |
| --- | --------------------------------------------------- |
| 1   | Logowanie / rejestracja / autoryzacja               |
| 2   | Multi-user / współdzielenie danych                  |
| 3   | Integracja z bankiem (API)                          |
| 4   | Import/eksport danych (CSV, PDF, XLS)               |
| 5   | Notyfikacje / przypomnienia                         |
| 6   | Budżety i limity na kategorie                       |
| 7   | Recurring transactions (cykliczne)                  |
| 8   | Szyfrowanie danych                                  |
| 9   | Kopie zapasowe (backup/restore)                     |
| 10  | PWA / offline mode                                  |
| 11  | Dark mode toggle (jeśli HeroUI nie daje out-of-box) |
| 12  | Wiele kont bankowych / portfeli                     |

---

## 4. Plan prac – Etapy

### ✅ Etap 1: Setup projektu + Model danych

**Czas:** ~1 dzień

**Deliverables:**

- ✅ Projekt Next.js skonfigurowany z HeroUI + TailwindCSS
- ✅ Drizzle ORM + libSQL/SQLite zainicjowane
- ✅ Schemat bazy: `transactions`, `categories`, `settings`
- ✅ Seed data załadowane

**Definition of Done:**

- ✅ `npx drizzle-kit push` wykonuje się bez błędów
- ✅ `npx tsx src/db/seed.ts` ładuje przykładowe dane
- ✅ Aplikacja uruchamia się (`npm run dev`)

**Ryzyka:**
| Ryzyko | Mitigacja |
|--------|-----------|
| Konflikt wersji Drizzle/libSQL | Użyć sprawdzonych wersji z dokumentacji |
| Problem z HeroUI setup | Fallback: shadcn/ui |

---

### 🔄 Etap 2: CRUD Transakcji (w trakcie)

**Czas:** ~2 dni

**Deliverables:**

- ✅ Strona listy transakcji (`/transactions`)
- ✅ Formularz dodawania transakcji
- ⏳ Formularz edycji transakcji
- ⏳ Usuwanie z potwierdzeniem
- ✅ Walidacja po stronie klienta i serwera

**Definition of Done:**

- ✅ Można dodać transakcję
- ✅ Walidacja blokuje nieprawidłowe dane
- ✅ Lista odświeża się po dodaniu
- ⏳ Można edytować transakcję
- ⏳ Można usunąć transakcję

**Ryzyka:**
| Ryzyko | Mitigacja |
|--------|-----------|
| Problemy z Server Actions | Fallback: API Routes |
| Re-renderowanie listy | Użyć React Query lub revalidatePath |

---

### Etap 3: CRUD Kategorii + Przypisywanie

**Czas:** ~1 dzień

**Deliverables:**

- Strona listy kategorii (`/categories`)
- Formularz dodawania/edycji kategorii
- Dropdown kategorii w formularzu transakcji
- Obsługa usuwania kategorii (nullowanie w transakcjach)

**Definition of Done:**

- Można tworzyć, edytować, usuwać kategorie
- Transakcje można przypisywać do kategorii
- Usunięcie kategorii nie psuje transakcji

**Ryzyka:**
| Ryzyko | Mitigacja |
|--------|-----------|
| Cascading delete problemów | Użyć `onDelete: "set null"` w Drizzle schema |

---

### Etap 4: Filtry + Podsumowania + Select Period

**Czas:** ~2 dni

**Deliverables:**

- Komponent `SelectPeriod` (presety + custom date range)
- Filtry na liście transakcji (typ, kategoria, okres)
- Dashboard (`/`) z podsumowaniem (income, expense, balance)
- Strona ustawień (`/settings`) z wyborem waluty

**Definition of Done:**

- Filtry działają poprawnie i łączą się (AND)
- Dashboard pokazuje poprawne sumy dla wybranego okresu
- Waluta wpływa na formatowanie w całej aplikacji

**Ryzyka:**
| Ryzyko | Mitigacja |
|--------|-----------|
| Skomplikowana logika dat | Użyć date-fns do operacji na datach |
| State management | Context API lub Zustand dla globalnego stanu (okres, waluta) |

---

### Etap 5: Wykresy + Polish

**Czas:** ~2 dni

**Deliverables:**

- Wykres kołowy (PieChart) – wydatki wg kategorii
- Wykres słupkowy (BarChart) – income vs expense per miesiąc
- Responsywność (mobile-first)
- Empty states dla brakujących danych
- Final QA i bugfixy

**Definition of Done:**

- Wykresy renderują się poprawnie z danymi i bez
- Aplikacja działa na mobile i desktop
- Brak krytycznych bugów

**Ryzyka:**
| Ryzyko | Mitigacja |
|--------|-----------|
| Recharts problemy z SSR | Użyć dynamic import z `ssr: false` |
| Performance przy dużej ilości danych | Agregacja po stronie serwera (Drizzle SQL aggregations) |

---

## 5. Architektura – Poziom komponentów

### Struktura katalogów

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Dashboard (/)
│   ├── transactions/
│   │   └── page.tsx          # Lista transakcji
│   ├── categories/
│   │   └── page.tsx          # Lista kategorii
│   ├── settings/
│   │   └── page.tsx          # Ustawienia
│   ├── layout.tsx            # Root layout
│   └── api/                  # API Routes (jeśli potrzebne)
│
├── components/
│   ├── ui/                   # Reusable UI (HeroUI wrappers)
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionItem.tsx
│   │   └── TransactionFilters.tsx
│   ├── categories/
│   │   ├── CategoryList.tsx
│   │   ├── CategoryForm.tsx
│   │   └── CategoryItem.tsx
│   ├── dashboard/
│   │   ├── SummaryCards.tsx
│   │   ├── ExpensesPieChart.tsx
│   │   └── IncomeExpenseBarChart.tsx
│   ├── shared/
│   │   ├── SelectPeriod.tsx
│   │   ├── ConfirmModal.tsx
│   │   └── EmptyState.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
│
├── db/                       # Drizzle ORM
│   ├── index.ts              # Drizzle client
│   ├── schema.ts             # Database schema
│   └── seed.ts               # Seed data script
│
├── lib/
│   ├── utils.ts              # Helper functions
│   └── format.ts             # Currency/date formatting
│
├── services/                 # Business logic / data access
│   ├── transactions.ts
│   ├── categories.ts
│   ├── summary.ts
│   └── settings.ts
│
├── hooks/
│   ├── useTransactions.ts
│   ├── useCategories.ts
│   ├── useSummary.ts
│   └── usePeriod.ts
│
├── types/
│   └── index.ts              # TypeScript types (re-export z schema)
│
├── context/
│   ├── PeriodContext.tsx
│   └── SettingsContext.tsx
│
drizzle/                      # Migracje (generowane przez drizzle-kit)
drizzle.config.ts             # Konfiguracja Drizzle Kit
```

### Kontrakty funkcji (pseudokod)

```typescript
// --- Transactions ---
addTransaction(input: CreateTransactionInput): Promise<Transaction>
updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction>
deleteTransaction(id: string): Promise<void>
getTransactions(filters: TransactionFilters): Promise<Transaction[]>

// --- Categories ---
addCategory(input: CreateCategoryInput): Promise<Category>
updateCategory(id: string, input: UpdateCategoryInput): Promise<Category>
deleteCategory(id: string): Promise<void>
getCategories(): Promise<Category[]>

// --- Summary ---
getSummary(period: DateRange): Promise<Summary>
// Summary = { totalIncome: number, totalExpense: number, balance: number }

getExpensesByCategory(period: DateRange): Promise<CategoryExpense[]>
// CategoryExpense = { categoryId: string, categoryName: string, total: number }

getMonthlyComparison(period: DateRange): Promise<MonthlyData[]>
// MonthlyData = { month: string, income: number, expense: number }

// --- Settings ---
getSettings(): Promise<Settings>
updateSettings(input: UpdateSettingsInput): Promise<Settings>
```

### Zasady walidacji

| Pole                | Walidacja                                    |
| ------------------- | -------------------------------------------- |
| `amount`            | Wymagane, number > 0                         |
| `type`              | Wymagane, enum: `income` \| `expense`        |
| `date`              | Wymagane, format ISO, ≤ dziś                 |
| `categoryId`        | Opcjonalne, jeśli podane – musi istnieć w DB |
| `description`       | Opcjonalne, max 500 znaków                   |
| `category.name`     | Wymagane, 1-100 znaków, unikalne             |
| `settings.currency` | Enum: `PLN` \| `EUR` \| `USD`                |

---

## 6. Checklista testów PoC

### CRUD Transakcji

| #   | Scenariusz                                        | Typ        |
| --- | ------------------------------------------------- | ---------- |
| T1  | ✅ Dodanie transakcji z poprawnymi danymi         | Happy path |
| T2  | ✅ Dodanie transakcji – kwota = 0 → błąd          | Edge case  |
| T3  | ✅ Dodanie transakcji – kwota ujemna → błąd       | Edge case  |
| T4  | ✅ Dodanie transakcji – data z przyszłości → błąd | Edge case  |
| T5  | ✅ Dodanie transakcji bez kategorii → sukces      | Happy path |
| T6  | Edycja transakcji – zmiana wszystkich pól         | Happy path |
| T7  | Usunięcie transakcji – potwierdzenie → sukces     | Happy path |
| T8  | Usunięcie transakcji – anulowanie → brak zmian    | Edge case  |

### CRUD Kategorii

| #   | Scenariusz                                                | Typ        |
| --- | --------------------------------------------------------- | ---------- |
| T9  | Dodanie kategorii z unikalną nazwą                        | Happy path |
| T10 | Dodanie kategorii – pusta nazwa → błąd                    | Edge case  |
| T11 | Dodanie kategorii – duplikat nazwy → błąd                 | Edge case  |
| T12 | Edycja kategorii – zmiana nazwy                           | Happy path |
| T13 | Usunięcie kategorii bez transakcji                        | Happy path |
| T14 | Usunięcie kategorii z transakcjami → transakcje mają null | Edge case  |

### Filtrowanie

| #   | Scenariusz                               | Typ        |
| --- | ---------------------------------------- | ---------- |
| T15 | Filtr po typie: tylko income             | Happy path |
| T16 | Filtr po typie: tylko expense            | Happy path |
| T17 | Filtr po kategorii                       | Happy path |
| T18 | Filtr po dacie (preset: bieżący miesiąc) | Happy path |
| T19 | Filtr po dacie (custom range)            | Happy path |
| T20 | Kombinacja filtrów                       | Happy path |
| T21 | Filtry bez wyników → "Brak transakcji"   | Edge case  |

### Podsumowanie i wykresy

| #   | Scenariusz                                         | Typ        |
| --- | -------------------------------------------------- | ---------- |
| T22 | Dashboard pokazuje poprawne sumy                   | Happy path |
| T23 | Dashboard dla okresu bez transakcji → wszystko = 0 | Edge case  |
| T24 | Wykres kołowy – poprawne % kategorii               | Happy path |
| T25 | Wykres kołowy – brak wydatków → empty state        | Edge case  |
| T26 | Wykres słupkowy – poprawne wartości per miesiąc    | Happy path |
| T27 | Wykres słupkowy – miesiąc bez danych → słupki = 0  | Edge case  |

### Ustawienia

| #   | Scenariusz                                      | Typ        |
| --- | ----------------------------------------------- | ---------- |
| T28 | Zmiana waluty na EUR → formatowanie zmienia się | Happy path |
| T29 | Waluta persystuje po odświeżeniu                | Happy path |

---

## 7. Seed Data

### Kategorie (8)

| ID    | Nazwa     | Opis                          |
| ----- | --------- | ----------------------------- |
| cat-1 | Jedzenie  | Zakupy spożywcze, restauracje |
| cat-2 | Transport | Paliwo, bilety, Uber          |
| cat-3 | Rachunki  | Prąd, gaz, internet           |
| cat-4 | Rozrywka  | Kino, gry, subskrypcje        |
| cat-5 | Zdrowie   | Leki, wizyty lekarskie        |
| cat-6 | Pensja    | Wynagrodzenie z pracy         |
| cat-7 | Freelance | Dochody z dodatkowych zleceń  |
| cat-8 | Inne      | Pozostałe                     |

### Transakcje (15)

| #   | Data       | Typ     | Kwota   | Kategoria | Opis                        |
| --- | ---------- | ------- | ------- | --------- | --------------------------- |
| 1   | 2024-12-01 | income  | 8500.00 | Pensja    | Wynagrodzenie grudzień      |
| 2   | 2024-12-03 | expense | 450.00  | Jedzenie  | Zakupy tygodniowe Biedronka |
| 3   | 2024-12-05 | expense | 200.00  | Transport | Tankowanie                  |
| 4   | 2024-12-07 | expense | 350.00  | Rachunki  | Prąd                        |
| 5   | 2024-12-08 | expense | 60.00   | Rozrywka  | Netflix + Spotify           |
| 6   | 2024-12-10 | income  | 1200.00 | Freelance | Projekt dla klienta X       |
| 7   | 2024-12-10 | expense | 380.00  | Jedzenie  | Zakupy tygodniowe           |
| 8   | 2024-12-12 | expense | 150.00  | Zdrowie   | Wizyta u dentysty           |
| 9   | 2024-12-15 | expense | 89.00   | Rozrywka  | Kino + popcorn              |
| 10  | 2024-11-01 | income  | 8500.00 | Pensja    | Wynagrodzenie listopad      |
| 11  | 2024-11-05 | expense | 520.00  | Jedzenie  | Zakupy                      |
| 12  | 2024-11-10 | expense | 280.00  | Rachunki  | Internet + telefon          |
| 13  | 2024-11-15 | expense | 190.00  | Transport | Uber                        |
| 14  | 2024-10-01 | income  | 8500.00 | Pensja    | Wynagrodzenie październik   |
| 15  | 2024-10-20 | expense | 1200.00 | Inne      | (brak kategorii - null)     |

**Uwagi do seed data:**

- Transakcje z różnych miesięcy (X, XI, XII 2024) → testowanie wykresów
- Mix income/expense → testowanie filtrów i bilansu
- Transakcja #15 bez kategorii → testowanie nullable category
- Różne kategorie → testowanie wykresu kołowego

---

## 8. Backlog

| ID    | Story                     | Priorytet | Etap | AC (skrót)                  |
| ----- | ------------------------- | --------- | ---- | --------------------------- |
| US-1  | ✅ Dodawanie transakcji   | P0        | 2    | Formularz, walidacja, zapis |
| US-2  | Edycja transakcji         | P0        | 2    | Prefill, walidacja, update  |
| US-3  | Usuwanie transakcji       | P0        | 2    | Confirm modal, delete       |
| US-4  | Lista transakcji + filtry | P0        | 2,4  | Lista, sortowanie, filtry   |
| US-5  | CRUD kategorii            | P1        | 3    | Add, edit, delete, cascade  |
| US-6  | Dashboard podsumowanie    | P0        | 4    | Income, expense, balance    |
| US-7  | Wykres kołowy             | P1        | 5    | PieChart, % kategorii       |
| US-8  | Wykres słupkowy           | P1        | 5    | BarChart, monthly           |
| US-9  | Select Period             | P0        | 4    | Presets + custom range      |
| US-10 | Ustawienia waluty         | P2        | 4    | PLN/EUR/USD, formatting     |

---

## 9. Next Actions (najbliższe kroki)

1. ✅ **[Etap 1]** Zdefiniować schemat Drizzle (`src/db/schema.ts`) dla `transactions`, `categories`, `settings`
2. ✅ **[Etap 1]** Skonfigurować `drizzle.config.ts` i wykonać `drizzle-kit push`
3. ✅ **[Etap 1]** Stworzyć seed script (`src/db/seed.ts`) z danymi testowymi
4. ✅ **[Etap 2]** Zaimplementować service layer dla transakcji (`services/transactions.ts`)
5. ✅ **[Etap 2]** Zbudować `TransactionList` + `TransactionForm` components
6. ⏳ **[Etap 2]** Dodać edycję transakcji (US-2)
7. ⏳ **[Etap 2]** Dodać usuwanie transakcji z potwierdzeniem (US-3)

---

## Podsumowanie technologii

| Warstwa       | Technologia          |
| ------------- | -------------------- |
| Framework     | Next.js (App Router) |
| UI Components | HeroUI               |
| Styling       | TailwindCSS          |
| Charts        | Recharts             |
| Database      | SQLite / libSQL      |
| ORM           | Drizzle ORM          |
| Language      | TypeScript           |

---

_Dokument wygenerowany: 2024-12-13_
