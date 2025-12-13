# Dokumentacja - Punkty do uzupełnienia

> Dokument przygotowany na podstawie `POC_PLAN.md` - lista sekcji i punktów wymagających uzupełnienia w dokumentacji projektu.

---

## 1. Business Goals & Requirements

### Do uzupełnienia w głównej dokumentacji:

- [ ] **BG-1**: Dokumentacja funkcjonalności rejestrowania transakcji (przychody/wydatki)

  - Opis procesu dodawania transakcji
  - Wymagania biznesowe dla walidacji
  - Przykłady użycia

- [ ] **BG-2**: Dokumentacja systemu kategoryzacji

  - Jak działa przypisywanie kategorii
  - Wspólne kategorie dla income/expense
  - Zarządzanie kategoriami

- [ ] **BG-3**: Dokumentacja podsumowań okresowych

  - Jak obliczany jest bilans
  - Formuły dla przychodów/wydatków
  - Logika okresów czasowych

- [ ] **BG-4**: Dokumentacja wizualizacji danych

  - Opis wykresu kołowego wydatków
  - Opis wykresu słupkowego przychody vs wydatki
  - Format danych dla wykresów

- [ ] **BG-5**: Dokumentacja systemu filtrowania

  - Dostępne filtry (data, kategoria, typ)
  - Logika kombinacji filtrów (AND)
  - Przykłady użycia

- [ ] **BG-6**: Dokumentacja lokalnego przechowywania danych

  - Architektura SQLite/libSQL
  - Brak wymogu autoryzacji - uzasadnienie
  - Backup i migracja danych

- [ ] **BG-7**: Dokumentacja formatowania waluty
  - Obsługiwane waluty (PLN/EUR/USD)
  - Formatowanie kwot
  - Wpływ na wszystkie widoki

---

## 2. User Stories - Szczegółowa dokumentacja

### US-1: Dodawanie transakcji ✅ (zaimplementowane)

- [x] Opis funkcjonalności w `VIEWS_DESCRIPTION.md`
- [ ] **Dodać**: Szczegółowy opis walidacji (kwota > 0, data ≤ dziś)
- [ ] **Dodać**: Diagram przepływu danych (form → server action → DB)
- [ ] **Dodać**: Przykłady błędów walidacji i komunikatów
- [ ] **Dodać**: Dokumentacja testów (unit/integration/E2E)

### US-2: Edycja transakcji ⏳ (w trakcie)

- [ ] **Utworzyć sekcję**: Dokumentacja formularza edycji

  - Pre-fill danych
  - Walidacja (identyczna jak przy dodawaniu)
  - Aktualizacja listy po zapisie
  - Obsługa błędów

- [ ] **Dodać**: Diagram przepływu edycji
- [ ] **Dodać**: Przykłady użycia API/actions

### US-3: Usuwanie transakcji ⏳ (w trakcie)

- [ ] **Utworzyć sekcję**: Dokumentacja procesu usuwania

  - Modal potwierdzenia
  - Aktualizacja podsumowań i wykresów po usunięciu
  - Obsługa błędów

- [ ] **Dodać**: Diagram przepływu usuwania
- [ ] **Dodać**: Przykłady użycia

### US-4: Lista transakcji z filtrowaniem

- [ ] **Rozszerzyć**: Dokumentacja filtrów w `VIEWS_DESCRIPTION.md`

  - Szczegółowy opis każdego filtra
  - Kombinacja filtrów (AND logic)
  - Sortowanie (domyślnie: data malejąco)
  - Empty states

- [ ] **Dodać**: Przykłady zapytań z filtrami
- [ ] **Dodać**: Dokumentacja komponentu `TransactionFilters`

### US-5: Zarządzanie kategoriami (CRUD)

- [ ] **Utworzyć**: Pełna dokumentacja CRUD kategorii

  - Tworzenie kategorii (walidacja: unikalna nazwa)
  - Edycja kategorii
  - Usuwanie kategorii (cascade: set null)
  - Ochrona kategorii "Uncategorized" (jeśli istnieje)

- [ ] **Dodać**: Diagram relacji Category → Transaction
- [ ] **Dodać**: Przykłady użycia API

### US-6: Dashboard z podsumowaniem

- [ ] **Rozszerzyć**: Dokumentacja dashboardu w `VIEWS_DESCRIPTION.md`

  - Szczegółowy opis SummaryCards
  - Formuły obliczeń (totalIncome, totalExpense, balance)
  - Integracja z SelectPeriod
  - Formatowanie waluty

- [ ] **Dodać**: Diagram przepływu danych (DB → Summary → UI)
- [ ] **Dodać**: Przykłady obliczeń dla różnych okresów

### US-7: Wykres kołowy wydatków

- [ ] **Utworzyć**: Dokumentacja wykresu kołowego

  - Format danych wejściowych
  - Obliczanie % udziału kategorii
  - Obsługa braku danych (empty state)
  - Integracja z SelectPeriod

- [ ] **Dodać**: Przykłady danych i wizualizacji
- [ ] **Dodać**: Dokumentacja komponentu `ExpensesPieChart`

### US-8: Wykres słupkowy przychody vs wydatki

- [ ] **Utworzyć**: Dokumentacja wykresu słupkowego

  - Format danych (miesiące, income, expense)
  - Agregacja per miesiąc
  - Obsługa miesięcy bez danych (słupki = 0)
  - Integracja z SelectPeriod

- [ ] **Dodać**: Przykłady danych i wizualizacji
- [ ] **Dodać**: Dokumentacja komponentu `IncomeExpenseBarChart`

### US-9: Wybór okresu (Select Period)

- [ ] **Utworzyć**: Dokumentacja komponentu SelectPeriod

  - Presety (Bieżący miesiąc, Poprzedni miesiąc, Ostatnie 3/6/12 miesięcy)
  - Custom date range (date picker od-do)
  - Wpływ na dashboard, wykresy, listę transakcji
  - State management (Context API)

- [ ] **Dodać**: Diagram przepływu stanu okresu
- [ ] **Dodać**: Przykłady użycia

### US-10: Ustawienia waluty

- [ ] **Rozszerzyć**: Dokumentacja ustawień w `VIEWS_DESCRIPTION.md`

  - Szczegółowy opis wyboru waluty
  - Persystencja w bazie danych (singleton)
  - Wpływ na formatowanie w całej aplikacji
  - Domyślna waluta (PLN)

- [ ] **Dodać**: Przykłady formatowania dla różnych walut
- [ ] **Dodać**: Dokumentacja funkcji `formatCurrency()`

---

## 3. Architektura - Dokumentacja techniczna

### Struktura katalogów

- [x] Opis struktury w `POC_PLAN.md`
- [ ] **Utworzyć**: `ARCHITECTURE.md` z szczegółowym opisem:
  - Struktura katalogów i odpowiedzialność każdego
  - Wzorce projektowe użyte w projekcie
  - Separation of concerns (services, components, hooks)

### Kontrakty funkcji (API)

- [x] Pseudokod w `POC_PLAN.md`
- [ ] **Utworzyć**: `API_REFERENCE.md` z:
  - Szczegółowymi sygnaturami funkcji
  - Typami TypeScript dla wszystkich input/output
  - Przykładami użycia każdej funkcji
  - Dokumentacją błędów i wyjątków

### Zasady walidacji

- [x] Tabela walidacji w `POC_PLAN.md`
- [ ] **Rozszerzyć**: Dokumentacja walidacji z:
  - Szczegółowymi regułami dla każdego pola
  - Komunikatami błędów (PL/EN)
  - Przykładami nieprawidłowych danych
  - Testami walidacji

### State Management

- [ ] **Utworzyć sekcję**: Dokumentacja zarządzania stanem
  - Context API dla okresu i waluty
  - Server-side state (Next.js Server Components)
  - Client-side state (React hooks)
  - Synchronizacja między warstwami

### Data Flow

- [x] Podstawowy opis w `VIEWS_DESCRIPTION.md`
- [ ] **Rozszerzyć**: Szczegółowe diagramy przepływu danych:
  - Transaction creation flow
  - Transaction update flow
  - Transaction deletion flow
  - Filtering flow
  - Summary calculation flow

---

## 4. Testy - Dokumentacja

### Testing Pyramid

- [x] Opis w `TESTING_GUIDELINES.md`
- [ ] **Dodać**: Statystyki pokrycia testami
  - Aktualne pokrycie per moduł
  - Cele pokrycia (70%+)
  - Raport z testów

### Testy per User Story

- [ ] **Utworzyć**: `TEST_COVERAGE.md` z:
  - Listą testów dla każdej US
  - Statusem implementacji testów (✅/⏳/❌)
  - Linkami do plików testowych
  - Przykładami testów

### Definition of Done dla testów

- [x] Opis w `TESTING_GUIDELINES.md`
- [ ] **Dodać**: Checklista DoD dla każdej funkcjonalności
- [ ] **Dodać**: Przykłady spełnienia DoD

---

## 5. Deployment & Operations

### Setup środowiska deweloperskiego

- [ ] **Utworzyć**: `SETUP.md` z:
  - Wymaganiami systemowymi
  - Instrukcjami instalacji zależności
  - Konfiguracją bazy danych
  - Uruchomieniem seed data
  - Konfiguracją zmiennych środowiskowych

### Database Management

- [x] Podstawowe komendy w `DRIZZLE_SCHEMA_REFERENCE.md`
- [ ] **Rozszerzyć**: Dokumentacja zarządzania bazą:
  - Migracje (generate, apply)
  - Backup i restore
  - Seed data management
  - Troubleshooting common issues

### CI/CD

- [ ] **Utworzyć**: Dokumentacja CI/CD (jeśli dotyczy):
  - Pipeline konfiguracja
  - Testy automatyczne
  - Deployment process

---

## 6. Komponenty UI - Dokumentacja

### Komponenty transakcji

- [x] `TransactionForm` - opis w `VIEWS_DESCRIPTION.md`
- [ ] **Dodać**: Dokumentacja komponentów:
  - `TransactionList` - props, użycie, przykłady
  - `TransactionItem` - props, styling, interakcje
  - `TransactionFilters` - props, filtry, state

### Komponenty kategorii

- [ ] **Utworzyć**: Dokumentacja komponentów kategorii:
  - `CategoryList` - props, użycie
  - `CategoryForm` - props, walidacja
  - `CategoryItem` - props, akcje

### Komponenty dashboardu

- [ ] **Utworzyć**: Dokumentacja komponentów dashboardu:
  - `SummaryCards` - props, obliczenia
  - `ExpensesPieChart` - props, format danych
  - `IncomeExpenseBarChart` - props, format danych

### Komponenty shared

- [ ] **Utworzyć**: Dokumentacja komponentów współdzielonych:
  - `SelectPeriod` - props, presety, custom range
  - `ConfirmModal` - props, użycie
  - `EmptyState` - props, warianty

### Komponenty layout

- [ ] **Utworzyć**: Dokumentacja komponentów layout:
  - `Navbar` - struktura, nawigacja
  - `Sidebar` - struktura, responsive

---

## 7. Services Layer - Dokumentacja

### Transactions Service

- [ ] **Utworzyć**: Dokumentacja `services/transactions.ts`:
  - `createTransaction()` - input, output, błędy
  - `updateTransaction()` - input, output, błędy
  - `deleteTransaction()` - input, output, błędy
  - `getTransactions()` - filtry, output, przykłady

### Categories Service

- [ ] **Utworzyć**: Dokumentacja `services/categories.ts`:
  - `addCategory()` - input, output, walidacja
  - `updateCategory()` - input, output, walidacja
  - `deleteCategory()` - input, output, cascade
  - `getCategories()` - output, przykłady

### Summary Service

- [ ] **Utworzyć**: Dokumentacja `services/summary.ts`:
  - `getSummary()` - input (period), output, formuły
  - `getExpensesByCategory()` - input, output, format
  - `getMonthlyComparison()` - input, output, format

### Settings Service

- [ ] **Utworzyć**: Dokumentacja `services/settings.ts`:
  - `getSettings()` - output, singleton pattern
  - `updateSettings()` - input, output, persystencja

---

## 8. Hooks - Dokumentacja

- [ ] **Utworzyć**: `HOOKS_REFERENCE.md` z dokumentacją:
  - `useTransactions()` - zwracane wartości, użycie
  - `useCategories()` - zwracane wartości, użycie
  - `useSummary()` - zwracane wartości, użycie
  - `usePeriod()` - zwracane wartości, użycie
  - `use-theme.ts` - zwracane wartości, użycie

---

## 9. Utilities & Helpers - Dokumentacja

### Format utilities

- [ ] **Utworzyć**: Dokumentacja `lib/format.ts`:
  - `formatCurrency()` - parametry, przykłady, waluty
  - `formatDate()` - parametry, formaty, przykłady
  - Inne funkcje formatujące

### Other utilities

- [ ] **Utworzyć**: Dokumentacja innych utilities:
  - `lib/utils.ts` - helper functions
  - Funkcje pomocnicze w innych plikach

---

## 10. Backlog & Roadmap

- [x] Backlog w `POC_PLAN.md`
- [ ] **Utworzyć**: `ROADMAP.md` z:
  - Priorytetami funkcji
  - Timeline implementacji
  - Zależnościami między funkcjami
  - Out of scope features (z uzasadnieniem)

---

## 11. Troubleshooting & FAQ

- [ ] **Utworzyć**: `TROUBLESHOOTING.md` z:
  - Częstymi problemami i rozwiązaniami
  - Błędami bazy danych i ich rozwiązaniem
  - Problemami z testami
  - Problemami z buildem/deploymentem
  - FAQ dla deweloperów

---

## 12. Contributing Guidelines

- [ ] **Utworzyć**: `CONTRIBUTING.md` z:
  - Style guide (kod, commit messages)
  - Procesem tworzenia PR
  - Wymaganiami testowymi
  - Code review guidelines

---

## 13. README.md - Aktualizacja

- [ ] **Rozszerzyć**: `README.md` z:
  - Opisem projektu (business goals)
  - Screenshotami/demo
  - Quick start guide
  - Linkami do dokumentacji
  - Technologiami użytymi
  - Statusem projektu (PoC/MVP)
  - License

---

## 14. Diagramy i wizualizacje

- [ ] **Utworzyć**: Diagramy architektury:
  - Diagram komponentów (Component Diagram)
  - Diagram przepływu danych (Data Flow Diagram)
  - Diagram bazy danych (ERD - już częściowo w DRIZZLE_SCHEMA_REFERENCE.md)
  - Diagram sekwencji dla kluczowych operacji

---

## 15. Performance & Optimization

- [ ] **Utworzyć**: Dokumentacja optymalizacji:
  - Strategie cache'owania
  - Optymalizacja zapytań do bazy
  - Lazy loading komponentów
  - Code splitting
  - Bundle size optimization

---

## Podsumowanie

### Priorytet 1 (Krytyczne - przed prezentacją):

- US-2, US-3: Dokumentacja edycji i usuwania transakcji
- US-4: Rozszerzona dokumentacja filtrów
- US-6, US-7, US-8: Dokumentacja dashboardu i wykresów
- US-9: Dokumentacja SelectPeriod
- API_REFERENCE.md: Dokumentacja wszystkich services
- SETUP.md: Instrukcje setupu

### Priorytet 2 (Ważne):

- ARCHITECTURE.md: Szczegółowa architektura
- HOOKS_REFERENCE.md: Dokumentacja hooks
- TEST_COVERAGE.md: Pokrycie testami
- Rozszerzenie VIEWS_DESCRIPTION.md dla wszystkich widoków

### Priorytet 3 (Nice to have):

- Diagramy wizualne
- TROUBLESHOOTING.md
- CONTRIBUTING.md
- Performance documentation

---

_Utworzono: 2024-12-13_
_Na podstawie: POC_PLAN.md_




