# Drizzle Schema Reference

## Model danych (`src/db/schema.ts`)

```typescript
import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Enums as const objects (SQLite doesn't have native enums)
export const transactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type TransactionType =
  (typeof transactionType)[keyof typeof transactionType];

export const currency = {
  PLN: "PLN",
  EUR: "EUR",
  USD: "USD",
} as const;

export type Currency = (typeof currency)[keyof typeof currency];

// ============ TABLES ============

export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const transactions = sqliteTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  amount: real("amount").notNull(), // zawsze > 0
  type: text("type", { enum: ["INCOME", "EXPENSE"] }).notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(), // <= dziś
  description: text("description"), // opcjonalny, max 500 znaków
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().default("singleton"), // tylko jeden rekord
  currency: text("currency", { enum: ["PLN", "EUR", "USD"] })
    .notNull()
    .default("PLN"),
});

// ============ RELATIONS ============

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

// ============ TYPES ============

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
```

## Konfiguracja Drizzle (`drizzle.config.ts`)

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Relacje

```
Category 1 ──── * Transaction
   │                  │
   └── onDelete: "set null" (usunięcie kategorii = transakcje mają categoryId = null)
```

## Queries typowe

### Pobranie transakcji z filtrami

```typescript
import { and, gte, lte, eq, desc } from "drizzle-orm";
import db from "@/db";
import { transactions, categories } from "@/db/schema";

const result = await db
  .select({
    transaction: transactions,
    category: categories,
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(
    and(
      gte(transactions.date, startDate),
      lte(transactions.date, endDate),
      filterType ? eq(transactions.type, filterType) : undefined,
      filterCategoryId
        ? eq(transactions.categoryId, filterCategoryId)
        : undefined
    )
  )
  .orderBy(desc(transactions.date));
```

### Podsumowanie (agregacja)

```typescript
import { sql, eq, and, gte, lte } from "drizzle-orm";
import db from "@/db";
import { transactions } from "@/db/schema";

const summary = await db
  .select({
    type: transactions.type,
    total: sql<number>`SUM(${transactions.amount})`,
  })
  .from(transactions)
  .where(
    and(gte(transactions.date, startDate), lte(transactions.date, endDate))
  )
  .groupBy(transactions.type);

// Result: [{ type: 'INCOME', total: 9700 }, { type: 'EXPENSE', total: 1679 }]
```

### Wydatki per kategoria

```typescript
import { sql, eq, and, gte, lte } from "drizzle-orm";
import db from "@/db";
import { transactions, categories } from "@/db/schema";

const expensesByCategory = await db
  .select({
    categoryId: transactions.categoryId,
    categoryName: categories.name,
    total: sql<number>`SUM(${transactions.amount})`,
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(
    and(
      eq(transactions.type, "EXPENSE"),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    )
  )
  .groupBy(transactions.categoryId);
```

### CRUD Operations

```typescript
// Create
const newTransaction = await db
  .insert(transactions)
  .values({
    amount: 100,
    type: "EXPENSE",
    date: new Date(),
    description: "Zakupy",
    categoryId: "cat-id",
  })
  .returning();

// Update
const updated = await db
  .update(transactions)
  .set({ amount: 150, updatedAt: new Date() })
  .where(eq(transactions.id, "trans-id"))
  .returning();

// Delete
await db.delete(transactions).where(eq(transactions.id, "trans-id"));

// Get by ID
const transaction = await db.query.transactions.findFirst({
  where: eq(transactions.id, "trans-id"),
  with: { category: true },
});
```

## Seed data script (`src/db/seed.ts`)

```typescript
import db from "./index";
import { categories, transactions, settings } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(transactions);
  await db.delete(categories);
  await db.delete(settings);

  // Create settings
  await db.insert(settings).values({ id: "singleton", currency: "PLN" });

  // Create categories
  const [jedzenie, transport, rachunki, rozrywka, zdrowie, pensja, freelance] =
    await db
      .insert(categories)
      .values([
        { name: "Jedzenie" },
        { name: "Transport" },
        { name: "Rachunki" },
        { name: "Rozrywka" },
        { name: "Zdrowie" },
        { name: "Pensja" },
        { name: "Freelance" },
        { name: "Inne" },
      ])
      .returning();

  // Create transactions
  await db.insert(transactions).values([
    // Grudzień 2024
    {
      amount: 8500,
      type: "INCOME",
      date: new Date("2024-12-01"),
      categoryId: pensja.id,
      description: "Wynagrodzenie grudzień",
    },
    {
      amount: 450,
      type: "EXPENSE",
      date: new Date("2024-12-03"),
      categoryId: jedzenie.id,
      description: "Zakupy tygodniowe Biedronka",
    },
    {
      amount: 200,
      type: "EXPENSE",
      date: new Date("2024-12-05"),
      categoryId: transport.id,
      description: "Tankowanie",
    },
    {
      amount: 350,
      type: "EXPENSE",
      date: new Date("2024-12-07"),
      categoryId: rachunki.id,
      description: "Prąd",
    },
    {
      amount: 60,
      type: "EXPENSE",
      date: new Date("2024-12-08"),
      categoryId: rozrywka.id,
      description: "Netflix + Spotify",
    },
    {
      amount: 1200,
      type: "INCOME",
      date: new Date("2024-12-10"),
      categoryId: freelance.id,
      description: "Projekt dla klienta X",
    },
    {
      amount: 380,
      type: "EXPENSE",
      date: new Date("2024-12-10"),
      categoryId: jedzenie.id,
      description: "Zakupy tygodniowe",
    },
    {
      amount: 150,
      type: "EXPENSE",
      date: new Date("2024-12-12"),
      categoryId: zdrowie.id,
      description: "Wizyta u dentysty",
    },
    {
      amount: 89,
      type: "EXPENSE",
      date: new Date("2024-12-15"),
      categoryId: rozrywka.id,
      description: "Kino + popcorn",
    },
    // Listopad 2024
    {
      amount: 8500,
      type: "INCOME",
      date: new Date("2024-11-01"),
      categoryId: pensja.id,
      description: "Wynagrodzenie listopad",
    },
    {
      amount: 520,
      type: "EXPENSE",
      date: new Date("2024-11-05"),
      categoryId: jedzenie.id,
      description: "Zakupy",
    },
    {
      amount: 280,
      type: "EXPENSE",
      date: new Date("2024-11-10"),
      categoryId: rachunki.id,
      description: "Internet + telefon",
    },
    {
      amount: 190,
      type: "EXPENSE",
      date: new Date("2024-11-15"),
      categoryId: transport.id,
      description: "Uber",
    },
    // Październik 2024
    {
      amount: 8500,
      type: "INCOME",
      date: new Date("2024-10-01"),
      categoryId: pensja.id,
      description: "Wynagrodzenie październik",
    },
    {
      amount: 1200,
      type: "EXPENSE",
      date: new Date("2024-10-20"),
      categoryId: null,
      description: "Wydatek bez kategorii",
    },
  ]);

  console.log("✅ Seed data created!");
}

seed().catch(console.error);
```

## Environment variables

```env
# .env
DATABASE_URL="file:local.db"
# lub dla Turso:
# DATABASE_URL="libsql://your-db.turso.io"
# DATABASE_AUTH_TOKEN="your-token"
```

## Komendy

```bash
# Generowanie migracji
npx drizzle-kit generate

# Aplikowanie migracji
npx drizzle-kit migrate

# Push schema (dev - bez migracji)
npx drizzle-kit push

# Drizzle Studio (GUI do bazy)
npx drizzle-kit studio

# Seed data
npx tsx src/db/seed.ts
```

## package.json scripts (sugerowane)

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/db/seed.ts"
  }
}
```
