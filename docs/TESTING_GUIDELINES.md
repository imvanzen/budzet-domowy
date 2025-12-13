# Testing Guidelines - Budżet Domowy

## Overview

This project follows the **Testing Pyramid** approach with automated tests at three levels:

- **70% Unit Tests** - Fast, isolated tests for functions, utilities, and services
- **20% Integration Tests** - Component interactions and server actions
- **10% E2E Tests** - Full user flows through the application

## Testing Stack

- **Vitest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **In-memory SQLite** - Isolated database for tests

## Testing Pyramid

```
         🔴 E2E (10%)
        ╱─────────╲
       🟡 Integration (20%)
      ╱───────────────╲
     🔵 Unit Tests (70%)
    ╱─────────────────────╲
```

### Unit Tests (70%)

**What to test:**

- Pure functions (`lib/format.ts`)
- Service functions (`services/*.ts`)
- Custom hooks (`hooks/*.ts`)
- Utility functions

**Where:** `src/**/*.test.ts` or `src/**/__tests__/*.test.ts`

**Example:**

```typescript
import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/format";

describe("formatCurrency", () => {
  it("should format PLN currency correctly", () => {
    expect(formatCurrency(100.5, "PLN")).toBe("100,50 zł");
  });
});
```

### Integration Tests (20%)

**What to test:**

- Component interactions
- Form submissions
- Server actions
- Component + service integration

**Where:** `src/components/**/*.test.tsx` or `src/app/**/__tests__/*.test.tsx`

**Example:**

```typescript
import { render, screen, waitFor } from "@/__tests__/test-utils";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import userEvent from "@testing-library/user-event";

describe("TransactionForm", () => {
  it("should submit form with valid data", async () => {
    const user = userEvent.setup();
    render(<TransactionForm categories={[]} />);

    await user.type(screen.getByLabelText("Kwota"), "100");
    await user.click(screen.getByRole("button", { name: "Dodaj transakcję" }));

    await waitFor(() => {
      expect(screen.getByText("Transakcja została dodana")).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (10%)

**What to test:**

- Complete user flows
- Critical paths (transaction creation, filtering)
- Cross-page interactions

**Where:** `e2e/**/*.spec.ts`

**Example:**

```typescript
import { test, expect } from "@playwright/test";

test("should create and display transaction", async ({ page }) => {
  await page.goto("/transactions");
  await page.fill('[label="Kwota"]', "100");
  await page.click('button:has-text("Dodaj transakcję")');
  await expect(page.locator("text=100,00 zł")).toBeVisible();
});
```

## Test Structure

### File Naming

- Unit/Integration: `*.test.ts` or `*.test.tsx`
- E2E: `*.spec.ts`
- Co-locate tests with source files or use `__tests__` directories

### Test Organization

```typescript
describe("FeatureName", () => {
  describe("FunctionName or ComponentName", () => {
    it("should do something specific", () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Database Testing

### Using Test Database

Always use `useTestDb()` for database-dependent tests:

```typescript
import { useTestDb } from "@/__tests__/db/helpers";
import { seedTestDb } from "@/__tests__/db/fixtures";

describe("TransactionService", () => {
  const testDb = useTestDb();

  it("should create transaction", async () => {
    const { db } = testDb;
    await seedTestDb(db);

    // Your test code
  });
});
```

### Database Isolation

- Each test gets a **fresh in-memory database**
- No cleanup needed - automatic teardown
- Use `seedTestDb()` for consistent test data

## Component Testing

### Using Test Utils

Always use the custom `render` from test-utils:

```typescript
import { render, screen } from "@/__tests__/test-utils";
// NOT: import { render } from "@testing-library/react";
```

This automatically wraps components with necessary providers (HeroUI, Theme, etc.).

### Best Practices

1. **Query by role/label** - Prefer `getByRole`, `getByLabelText`
2. **Use userEvent** - More realistic than `fireEvent`
3. **Test behavior, not implementation** - Don't test internal state
4. **Wait for async** - Use `waitFor` or `findBy*` queries

## Test Requirements per Feature

### When Implementing a User Story

For each User Story, create tests covering:

1. **Unit Tests** (Required)

   - Service functions
   - Utility functions
   - Custom hooks

2. **Integration Tests** (Required)

   - Component rendering
   - Form validation
   - User interactions
   - Server actions

3. **E2E Tests** (Optional, for critical flows)
   - Complete user journey
   - Cross-page flows

### Example: US-1 (Dodawanie transakcji)

**Unit Tests:**

- ✅ `createTransaction()` service function
- ✅ `addTransaction()` server action validation

**Integration Tests:**

- ✅ `TransactionForm` renders correctly
- ✅ Form validation (amount > 0, date ≤ today)
- ✅ Form submission success
- ✅ Form submission error handling

**E2E Tests:**

- ✅ Complete flow: navigate → fill form → submit → verify in list

## Test Coverage Goals

- **Minimum:** 70% overall coverage
- **Unit tests:** 80%+ coverage for services and utilities
- **Integration tests:** All components with user interactions
- **E2E tests:** All critical user flows

## Running Tests

```bash
# Run all tests in watch mode
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E with UI
pnpm test:e2e:ui
```

## Test Data & Fixtures

Use `seedTestDb()` for consistent test data:

```typescript
import { seedTestDb } from "@/__tests__/db/fixtures";

// Seeds: categories, transactions, settings
await seedTestDb(db);
```

Create custom fixtures when needed:

```typescript
// src/__tests__/fixtures/transactions.ts
export const mockTransaction = {
  amount: 100,
  type: "INCOME",
  date: new Date("2024-01-15"),
  // ...
};
```

## Common Patterns

### Testing Async Functions

```typescript
it("should handle async operation", async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Form Validation

```typescript
it("should show error for invalid amount", async () => {
  const user = userEvent.setup();
  render(<TransactionForm categories={[]} />);

  await user.type(screen.getByLabelText("Kwota"), "0");
  await user.click(screen.getByRole("button", { name: "Dodaj" }));

  expect(screen.getByText("Kwota musi być większa od 0")).toBeInTheDocument();
});
```

### Testing Server Actions

```typescript
import { addTransaction } from "@/app/transactions/actions";

it("should validate transaction data", async () => {
  const result = await addTransaction({
    amount: -10, // Invalid
    type: "INCOME",
    date: new Date(),
  });

  expect(result.success).toBe(false);
  expect(result.error).toContain("Kwota");
});
```

### Mocking Next.js Features

```typescript
// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));
```

## Definition of Done for Tests

A feature is considered "tested" when:

1. ✅ All service functions have unit tests
2. ✅ All components have integration tests
3. ✅ All validation logic is tested
4. ✅ Error cases are covered
5. ✅ Critical flows have E2E tests (if applicable)
6. ✅ Tests pass in CI/CD
7. ✅ Coverage meets minimum thresholds

## CI/CD Integration

Tests should run automatically on:

- Every pull request
- Before merging to main
- On every commit (optional, can be nightly)

## Troubleshooting

### Database not initialized error

```typescript
// ❌ Wrong - accessing db at describe level
const { db } = useTestDb();
it("test", () => { db.select()... });

// ✅ Correct - access inside test
const testDb = useTestDb();
it("test", async () => {
  const { db } = testDb;
  await db.select()...;
});
```

### matchMedia error

Already handled in `src/__tests__/setup.ts`. If you see this error, check that setup file is imported.

### Provider errors

Always use `render` from `@/__tests__/test-utils`, not from `@testing-library/react`.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
