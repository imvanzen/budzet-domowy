import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { categories, transactions, settings } from "../src/db/schema";

const client = createClient({
  url: process.env.DB_FILE_NAME!,
});

const db = drizzle(client);

// Helper function to generate random amount within range
function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Helper function to get a random item from array
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(transactions);
  await db.delete(categories);
  await db.delete(settings);

  // Seed categories
  const seedCategories = [
    { name: "Jedzenie" }, // Food
    { name: "Transport" }, // Transport
    { name: "Rozrywka" }, // Entertainment
    { name: "Zdrowie" }, // Health
    { name: "Mieszkanie" }, // Housing
    { name: "Edukacja" }, // Education
    { name: "Premia" }, // Bonus
    { name: "Inne" }, // Other
  ];

  const insertedCategories = await db
    .insert(categories)
    .values(seedCategories)
    .returning();

  console.log(`✅ Created ${insertedCategories.length} categories`);

  // Get category IDs
  const catMap = {
    food: insertedCategories.find((c) => c.name === "Jedzenie")!.id,
    transport: insertedCategories.find((c) => c.name === "Transport")!.id,
    entertainment: insertedCategories.find((c) => c.name === "Rozrywka")!.id,
    health: insertedCategories.find((c) => c.name === "Zdrowie")!.id,
    housing: insertedCategories.find((c) => c.name === "Mieszkanie")!.id,
    education: insertedCategories.find((c) => c.name === "Edukacja")!.id,
    bonus: insertedCategories.find((c) => c.name === "Premia")!.id,
    other: insertedCategories.find((c) => c.name === "Inne")!.id,
  };

  // Generate 2 years of transactions
  const today = new Date();
  const twoYearsAgo = new Date(today);
  twoYearsAgo.setFullYear(today.getFullYear() - 2);

  const allTransactions: Array<{
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: Date;
    description: string;
    categoryId: string;
  }> = [];

  // Generate monthly recurring transactions for 24 months
  for (let monthOffset = 0; monthOffset < 24; monthOffset++) {
    const date = new Date(twoYearsAgo);
    date.setMonth(date.getMonth() + monthOffset);

    // RECURRING INCOME
    // Monthly salary (always on 25th or last day of month)
    const salaryDate = new Date(date.getFullYear(), date.getMonth(), 25);
    allTransactions.push({
      amount: randomAmount(4500, 5500),
      type: "INCOME",
      date: salaryDate,
      description: "Wynagrodzenie miesięczne",
      categoryId: catMap.other, // Using "Inne" for salary since no specific category
    });

    // RECURRING EXPENSES
    // Rent/Mortgage (1st of month)
    allTransactions.push({
      amount: randomAmount(1800, 2200),
      type: "EXPENSE",
      date: new Date(date.getFullYear(), date.getMonth(), 1),
      description: "Czynsz",
      categoryId: catMap.housing,
    });

    // Utilities (15th of month)
    allTransactions.push({
      amount: randomAmount(300, 500),
      type: "EXPENSE",
      date: new Date(date.getFullYear(), date.getMonth(), 15),
      description: "Opłaty: prąd, gaz, woda",
      categoryId: catMap.housing,
    });

    // Internet/Phone (10th of month)
    allTransactions.push({
      amount: randomAmount(80, 120),
      type: "EXPENSE",
      date: new Date(date.getFullYear(), date.getMonth(), 10),
      description: "Internet i telefon",
      categoryId: catMap.housing,
    });

    // Transport pass (5th of month)
    allTransactions.push({
      amount: randomAmount(100, 150),
      type: "EXPENSE",
      date: new Date(date.getFullYear(), date.getMonth(), 5),
      description: "Bilet miesięczny komunikacja",
      categoryId: catMap.transport,
    });

    // NON-RECURRING INCOME
    // Occasional bonus (20% chance per month)
    if (Math.random() < 0.2) {
      allTransactions.push({
        amount: randomAmount(500, 1500),
        type: "INCOME",
        date: new Date(date.getFullYear(), date.getMonth(), randomAmount(1, 28)),
        description: randomItem(["Premia kwartalna", "Bonus za projekt", "Nagroda"]),
        categoryId: catMap.bonus,
      });
    }

    // NON-RECURRING EXPENSES
    // Groceries (3-4 times per month)
    const groceryCount = Math.floor(randomAmount(3, 4));
    for (let i = 0; i < groceryCount; i++) {
      allTransactions.push({
        amount: randomAmount(200, 400),
        type: "EXPENSE",
        date: new Date(
          date.getFullYear(),
          date.getMonth(),
          Math.floor(randomAmount(1, 28))
        ),
        description: randomItem([
          "Zakupy spożywcze Biedronka",
          "Zakupy Lidl",
          "Zakupy Kaufland",
          "Targ - warzywa i owoce",
        ]),
        categoryId: catMap.food,
      });
    }

    // Restaurants (2-3 times per month)
    const restaurantCount = Math.floor(randomAmount(2, 3));
    for (let i = 0; i < restaurantCount; i++) {
      allTransactions.push({
        amount: randomAmount(40, 120),
        type: "EXPENSE",
        date: new Date(
          date.getFullYear(),
          date.getMonth(),
          Math.floor(randomAmount(1, 28))
        ),
        description: randomItem([
          "Obiad w restauracji",
          "Pizza",
          "Sushi",
          "Lunch z przyjaciółmi",
          "Kolacja w mieście",
        ]),
        categoryId: catMap.food,
      });
    }

    // Transport/Fuel (2-3 times per month)
    const transportCount = Math.floor(randomAmount(2, 3));
    for (let i = 0; i < transportCount; i++) {
      allTransactions.push({
        amount: randomAmount(50, 200),
        type: "EXPENSE",
        date: new Date(
          date.getFullYear(),
          date.getMonth(),
          Math.floor(randomAmount(1, 28))
        ),
        description: randomItem([
          "Tankowanie",
          "Uber",
          "Bolt",
          "Taxi",
          "Parking",
        ]),
        categoryId: catMap.transport,
      });
    }

    // Entertainment (1-2 times per month)
    const entertainmentCount = Math.floor(randomAmount(1, 2));
    for (let i = 0; i < entertainmentCount; i++) {
      allTransactions.push({
        amount: randomAmount(30, 150),
        type: "EXPENSE",
        date: new Date(
          date.getFullYear(),
          date.getMonth(),
          Math.floor(randomAmount(1, 28))
        ),
        description: randomItem([
          "Kino",
          "Teatr",
          "Koncert",
          "Netflix",
          "Spotify Premium",
          "Gry komputerowe",
          "Książki",
        ]),
        categoryId: catMap.entertainment,
      });
    }

    // Health (occasional - 30% chance per month)
    if (Math.random() < 0.3) {
      allTransactions.push({
        amount: randomAmount(50, 300),
        type: "EXPENSE",
        date: new Date(
          date.getFullYear(),
          date.getMonth(),
          Math.floor(randomAmount(1, 28))
        ),
        description: randomItem([
          "Wizyta u lekarza",
          "Leki",
          "Dentysta",
          "Badania",
          "Okulary",
        ]),
        categoryId: catMap.health,
      });
    }

    // Education (occasional - 20% chance per month)
    if (Math.random() < 0.2) {
      allTransactions.push({
        amount: randomAmount(100, 500),
        type: "EXPENSE",
        date: new Date(
          date.getFullYear(),
          date.getMonth(),
          Math.floor(randomAmount(1, 28))
        ),
        description: randomItem([
          "Kurs online",
          "Książki techniczne",
          "Konferencja",
          "Warsztaty",
          "Szkolenie",
        ]),
        categoryId: catMap.education,
      });
    }

    // Other expenses (1-2 times per month)
    const otherCount = Math.floor(randomAmount(1, 2));
    for (let i = 0; i < otherCount; i++) {
      allTransactions.push({
        amount: randomAmount(50, 300),
        type: "EXPENSE",
        date: new Date(
          date.getFullYear(),
          date.getMonth(),
          Math.floor(randomAmount(1, 28))
        ),
        description: randomItem([
          "Ubrania",
          "Prezent",
          "Fryzjer",
          "Kosmetyki",
          "Elektronika",
          "Wyposażenie domu",
          "Naprawy",
        ]),
        categoryId: catMap.other,
      });
    }
  }

  // Insert all transactions in batches
  const batchSize = 100;
  for (let i = 0; i < allTransactions.length; i += batchSize) {
    const batch = allTransactions.slice(i, i + batchSize);
    await db.insert(transactions).values(batch);
    console.log(
      `✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allTransactions.length / batchSize)}`
    );
  }

  console.log(`✅ Created ${allTransactions.length} transactions over 2 years`);

  // Seed settings
  await db.insert(settings).values({
    id: "singleton",
    currency: "PLN",
  });

  console.log("✅ Created settings");

  console.log("🎉 Seeding completed!");
  console.log(`   Total transactions: ${allTransactions.length}`);
  console.log(`   Income transactions: ${allTransactions.filter((t) => t.type === "INCOME").length}`);
  console.log(`   Expense transactions: ${allTransactions.filter((t) => t.type === "EXPENSE").length}`);
  
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
