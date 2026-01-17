# Process testowy

## Testy jednostkowe i integracyjne

```bash
# Uruchomienie testów w trybie watch
pnpm test

# Uruchomienie testów jednorazowo
pnpm test:run

# Uruchomienie testów z interfejsem graficznym
pnpm test:ui

# Uruchomienie testów z raportem pokrycia
pnpm test:coverage
```

## Testy E2E

```bash
# Uruchomienie testów E2E
pnpm test:e2e

# Uruchomienie testów E2E z interfejsem graficznym
pnpm test:e2e:ui

# Uruchomienie testów E2E w trybie debug
pnpm test:e2e:debug
```

## Struktura testów

Projekt wykorzystuje piramidę testową:
- **70%** - Testy jednostkowe (funkcje, serwisy, utility)
- **20%** - Testy integracyjne (komponenty, akcje serwerowe)
- **10%** - Testy E2E (pełne przepływy użytkownika)

## Lokalizacja testów

- Testy jednostkowe: `src/**/*.test.ts` lub `src/**/__tests__/*.test.ts`
- Testy komponentów: `src/components/**/*.test.tsx`
- Testy E2E: `e2e/**/*.spec.ts`

## Narzędzia testowe

- **Vitest** - framework testowy
- **React Testing Library** - testowanie komponentów React
- **Playwright** - testy end-to-end
- **In-memory SQLite** - izolowana baza danych dla testów

