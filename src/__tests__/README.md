# Testing Guide

This project uses **Vitest** for unit/integration tests and **Playwright** for E2E tests.

## Quick Start

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

## Test Structure

```
src/
  __tests__/
    setup.ts              # Global test setup
    test-utils.tsx        # Custom render with providers
    db/
      test-db.ts         # Database setup/teardown utilities
      fixtures.ts        # Test data fixtures
      helpers.ts         # Database test helpers
    example.test.tsx     # Example tests
e2e/
  example.spec.ts        # Example E2E test
```

## Writing Component Tests

Use the custom `render` from `test-utils` to get providers automatically:

```tsx
import { render, screen } from "@/__tests__/test-utils";
import { MyComponent } from "@/components/MyComponent";

test("renders component", () => {
  render(<MyComponent />);
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
```

## Writing Database Tests

Use `useTestDb()` to get an isolated database for each test:

```tsx
import { describe, it, expect } from "vitest";
import { useTestDb } from "@/__tests__/db/helpers";
import { seedTestDb } from "@/__tests__/db/fixtures";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

describe("My Database Tests", () => {
  const { db } = useTestDb();

  it("should query data", async () => {
    await seedTestDb(db);

    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, "cat-1"));

    expect(result).toHaveLength(1);
  });
});
```

## Database Isolation

- Each test gets a **fresh in-memory SQLite database**
- Tests are completely isolated from each other
- No cleanup needed - database is destroyed after each test
- Use `seedTestDb()` to populate with fixtures

## E2E Tests

E2E tests run against a real Next.js server. The database is configured via environment variables.

```ts
import { test, expect } from "@playwright/test";

test("should create a transaction", async ({ page }) => {
  await page.goto("/transactions");
  // ... test interactions
});
```

## Best Practices

1. **Test behavior, not implementation** - Query by role/label, not class names
2. **Use fixtures** - Reuse test data with `seedTestDb()`
3. **Isolate tests** - Each test should be independent
4. **Use async queries** - Prefer `findBy*` over `getBy*` for async content
5. **Mock external APIs** - Use MSW or similar for external services

## Coverage

```bash
pnpm test:coverage
```

Coverage reports are generated in `coverage/` directory.
