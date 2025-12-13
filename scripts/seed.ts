import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { categories, transactions, settings } from "../src/db/schema";

const client = createClient({
  url: process.env.DB_FILE_NAME!,
});

const db = drizzle(client);

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(transactions);
  await db.delete(categories);
  await db.delete(settings);

  // Seed categories
  const seedCategories = [
    { name: "Jedzenie" },
    { name: "Transport" },
    { name: "Rozrywka" },
    { name: "Zdrowie" },
    { name: "Mieszkanie" },
    { name: "Zakupy" },
    { name: "Edukacja" },
    { name: "Inne" },
    { name: "Wynagrodzenie" },
    { name: "Premia" },
    { name: "Inne przychody" },
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(seedCategories)
    .returning();

  console.log(`✅ Created ${insertedCategories.length} categories`);

  // Get category IDs for transactions
  const foodCategory = insertedCategories.find((c) => c.name === "Jedzenie")!;
  const transportCategory = insertedCategories.find(
    (c) => c.name === "Transport"
  )!;
  const entertainmentCategory = insertedCategories.find(
    (c) => c.name === "Rozrywka"
  )!;
  const salaryCategory = insertedCategories.find(
    (c) => c.name === "Wynagrodzenie"
  )!;
  const bonusCategory = insertedCategories.find((c) => c.name === "Premia")!;

  // Seed transactions
  const now = new Date();
  const seedTransactions = [
    // Expenses
    {
      amount: 150.0,
      type: "EXPENSE" as const,
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      description: "Zakupy w Biedronce",
      categoryId: foodCategory.id,
    },
    {
      amount: 45.0,
      type: "EXPENSE" as const,
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // yesterday
      description: "Bilet miesięczny",
      categoryId: transportCategory.id,
    },
    {
      amount: 80.0,
      type: "EXPENSE" as const,
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      description: "Kino",
      categoryId: entertainmentCategory.id,
    },
    {
      amount: 200.0,
      type: "EXPENSE" as const,
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // week ago
      description: "Zakupy spożywcze",
      categoryId: foodCategory.id,
    },
    // Income
    {
      amount: 5000.0,
      type: "INCOME" as const,
      date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // month ago
      description: "Wypłata",
      categoryId: salaryCategory.id,
    },
    {
      amount: 500.0,
      type: "INCOME" as const,
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      description: "Premia za projekt",
      categoryId: bonusCategory.id,
    },
  ];

  const insertedTransactions = await db
    .insert(transactions)
    .values(seedTransactions)
    .returning();

  console.log(`✅ Created ${insertedTransactions.length} transactions`);

  // Seed settings
  await db.insert(settings).values({
    id: "singleton",
    currency: "PLN",
  });

  console.log("✅ Created settings");

  console.log("🎉 Seeding completed!");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
