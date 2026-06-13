import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { categories, transactions } from "../src/db/schema";
import type { Category } from "../src/db/schema";

const client = createClient({
  url: process.env.DB_FILE_NAME!,
});

const db = drizzle(client);

const SEED = 20250613;
const START_DATE = new Date(2025, 0, 1);
const END_DATE = new Date(2026, 5, 13); // today
const BATCH_SIZE = 100;

type TransactionDraft = {
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: Date;
  description: string;
  categoryId: string;
};

type CategoryRole =
  | "food"
  | "transport"
  | "entertainment"
  | "health"
  | "housing"
  | "education"
  | "bonus"
  | "salary"
  | "other";

type CategoryMap = Record<CategoryRole, string | undefined> & {
  byId: Map<string, CategoryRole>;
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRng(seed: number) {
  const random = mulberry32(seed);
  return {
    float: (min: number, max: number) => min + random() * (max - min),
    int: (min: number, max: number) => Math.floor(min + random() * (max - min + 1)),
    amount: (min: number, max: number) =>
      Math.round((min + random() * (max - min)) * 100) / 100,
    pick: <T>(items: T[]): T => items[Math.floor(random() * items.length)],
    chance: (probability: number) => random() < probability,
  };
}

function classifyCategory(name: string): CategoryRole {
  const normalized = name.toLowerCase();

  if (/(jedzen|food|grocery|restaurant)/.test(normalized)) return "food";
  if (/(transport|komunik|paliw|fuel)/.test(normalized)) return "transport";
  if (/(rozryw|entertain|netflix|spotify|kino)/.test(normalized)) {
    return "entertainment";
  }
  if (/(zdrow|health|lekarz|apteka)/.test(normalized)) return "health";
  if (/(mieszkan|housing|czynsz|rent)/.test(normalized)) return "housing";
  if (/(edukac|education|kurs|szkolen)/.test(normalized)) return "education";
  if (/(premi|bonus)/.test(normalized)) return "bonus";
  if (/(salary|wynagrod|płac|plac)/.test(normalized)) return "salary";

  return "other";
}

function buildCategoryMap(existing: Category[]): CategoryMap {
  const map: CategoryMap = {
    food: undefined,
    transport: undefined,
    entertainment: undefined,
    health: undefined,
    housing: undefined,
    education: undefined,
    bonus: undefined,
    salary: undefined,
    other: undefined,
    byId: new Map(),
  };

  const assigned = new Set<string>();
  const orphans: Category[] = [];

  for (const category of existing) {
    const role = classifyCategory(category.name);
    map.byId.set(category.id, role);
    if (!map[role]) {
      map[role] = category.id;
      assigned.add(category.id);
    } else {
      orphans.push(category);
    }
  }

  const rolePriority: CategoryRole[] = [
    "education",
    "other",
    "food",
    "transport",
    "entertainment",
    "health",
    "housing",
    "bonus",
    "salary",
  ];

  for (const role of rolePriority) {
    if (map[role] || orphans.length === 0) continue;
    const next = orphans.shift()!;
    map[role] = next.id;
    map.byId.set(next.id, role);
    assigned.add(next.id);
  }

  return map;
}

function resolveCategory(
  map: CategoryMap,
  role: CategoryRole,
  fallback?: string,
): string {
  return map[role] ?? fallback ?? map.other ?? [...map.byId.keys()][0];
}

function clampDate(date: Date): Date {
  const capped = date > END_DATE ? new Date(END_DATE) : date;
  capped.setHours(12, 0, 0, 0);
  return capped;
}

function monthDate(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return clampDate(new Date(year, month, Math.min(day, lastDay)));
}

function addTransaction(
  list: TransactionDraft[],
  map: CategoryMap,
  draft: Omit<TransactionDraft, "categoryId"> & { role: CategoryRole },
) {
  if (draft.date < START_DATE || draft.date > END_DATE) return;

  list.push({
    amount: draft.amount,
    type: draft.type,
    date: draft.date,
    description: draft.description,
    categoryId: resolveCategory(map, draft.role),
  });
}

function generateMonthTransactions(
  year: number,
  month: number,
  map: CategoryMap,
  rng: ReturnType<typeof createRng>,
): TransactionDraft[] {
  const txs: TransactionDraft[] = [];
  const isWinter = month === 11 || month === 0 || month === 1;
  const isSummer = month >= 5 && month <= 7;
  const isDecember = month === 11;

  // --- recurring income ---
  addTransaction(txs, map, {
    amount: rng.amount(4800, 5600),
    type: "INCOME",
    date: monthDate(year, month, 25),
    description: "Wynagrodzenie miesięczne",
    role: "salary",
  });

  if (rng.chance(0.18)) {
    addTransaction(txs, map, {
      amount: rng.amount(600, 1800),
      type: "INCOME",
      date: monthDate(year, month, rng.int(10, 22)),
      description: rng.pick([
        "Premia kwartalna",
        "Bonus za projekt",
        "Nagroda roczna",
        "Premia zespołowa",
      ]),
      role: "bonus",
    });
  }

  if (rng.chance(0.12)) {
    addTransaction(txs, map, {
      amount: rng.amount(800, 2500),
      type: "INCOME",
      date: monthDate(year, month, rng.int(5, 20)),
      description: rng.pick([
        "Freelance - projekt IT",
        "Konsultacja",
        "Zlecenie dodatkowe",
      ]),
      role: "salary",
    });
  }

  // --- recurring expenses ---
  addTransaction(txs, map, {
    amount: rng.amount(1900, 2300),
    type: "EXPENSE",
    date: monthDate(year, month, 1),
    description: "Czynsz",
    role: "housing",
  });

  addTransaction(txs, map, {
    amount: rng.amount(isWinter ? 420 : 280, isWinter ? 620 : 480),
    type: "EXPENSE",
    date: monthDate(year, month, 15),
    description: "Opłaty: prąd, gaz, woda",
    role: "housing",
  });

  addTransaction(txs, map, {
    amount: rng.amount(85, 125),
    type: "EXPENSE",
    date: monthDate(year, month, 10),
    description: "Internet i telefon",
    role: "housing",
  });

  addTransaction(txs, map, {
    amount: rng.amount(110, 155),
    type: "EXPENSE",
    date: monthDate(year, month, 5),
    description: "Bilet miesięczny komunikacja",
    role: "transport",
  });

  addTransaction(txs, map, {
    amount: rng.amount(29.99, 59.99),
    type: "EXPENSE",
    date: monthDate(year, month, 3),
    description: rng.pick(["Netflix", "Spotify Premium", "HBO Max"]),
    role: "entertainment",
  });

  addTransaction(txs, map, {
    amount: rng.amount(99, 149),
    type: "EXPENSE",
    date: monthDate(year, month, 2),
    description: "Karnet na siłownię",
    role: "health",
  });

  if (rng.chance(0.7)) {
    addTransaction(txs, map, {
      amount: rng.amount(120, 280),
      type: "EXPENSE",
      date: monthDate(year, month, 20),
      description: rng.pick(["Ubezpieczenie zdrowotne", "Ubezpieczenie mieszkania"]),
      role: isWinter ? "housing" : "health",
    });
  }

  // --- high-frequency daily-ish ---
  const coffeeCount = rng.int(10, 14);
  for (let i = 0; i < coffeeCount; i++) {
    addTransaction(txs, map, {
      amount: rng.amount(12, 28),
      type: "EXPENSE",
      date: monthDate(year, month, rng.int(1, 28)),
      description: rng.pick([
        "Kawa na wynos",
        "Espresso w biurze",
        "Kawiarnia - latte",
        "Śniadanie w kawiarni",
      ]),
      role: "food",
    });
  }

  const groceryCount = rng.int(7, 10);
  for (let i = 0; i < groceryCount; i++) {
    addTransaction(txs, map, {
      amount: rng.amount(80, 380),
      type: "EXPENSE",
      date: monthDate(year, month, rng.int(1, 28)),
      description: rng.pick([
        "Zakupy spożywcze Biedronka",
        "Zakupy Lidl",
        "Zakupy Kaufland",
        "Zakupy Auchan",
        "Targ - warzywa i owoce",
        "Piekarstwo i nabiał",
      ]),
      role: "food",
    });
  }

  const restaurantCount = rng.int(isSummer ? 5 : 3, isSummer ? 8 : 6);
  for (let i = 0; i < restaurantCount; i++) {
    addTransaction(txs, map, {
      amount: rng.amount(35, 180),
      type: "EXPENSE",
      date: monthDate(year, month, rng.int(1, 28)),
      description: rng.pick([
        "Obiad w restauracji",
        "Pizza",
        "Sushi",
        "Lunch z przyjaciółmi",
        "Kolacja w mieście",
        "Burger i frytki",
        "Food truck",
      ]),
      role: "food",
    });
  }

  const transportCount = rng.int(5, 8);
  for (let i = 0; i < transportCount; i++) {
    addTransaction(txs, map, {
      amount: rng.amount(15, 220),
      type: "EXPENSE",
      date: monthDate(year, month, rng.int(1, 28)),
      description: rng.pick([
        "Tankowanie",
        "Uber",
        "Bolt",
        "Taxi",
        "Parking",
        "Autostrada A2",
        "Bilet PKP",
      ]),
      role: "transport",
    });
  }

  const entertainmentCount = rng.int(4, 7);
  for (let i = 0; i < entertainmentCount; i++) {
    addTransaction(txs, map, {
      amount: rng.amount(25, 350),
      type: "EXPENSE",
      date: monthDate(year, month, rng.int(1, 28)),
      description: rng.pick([
        "Kino",
        "Teatr",
        "Koncert",
        "Gry komputerowe Steam",
        "Książki",
        "Planszówki",
        "Wycieczka jednodniowa",
        "Muzeum",
      ]),
      role: "entertainment",
    });
  }

  const healthCount = rng.int(1, 3);
  for (let i = 0; i < healthCount; i++) {
    addTransaction(txs, map, {
      amount: rng.amount(30, 450),
      type: "EXPENSE",
      date: monthDate(year, month, rng.int(1, 28)),
      description: rng.pick([
        "Wizyta u lekarza",
        "Leki",
        "Dentysta",
        "Badania krwi",
        "Apteka",
        "Okulary",
        "Fizjoterapia",
      ]),
      role: "health",
    });
  }

  const educationCount = rng.int(1, 3);
  for (let i = 0; i < educationCount; i++) {
    addTransaction(txs, map, {
      amount: rng.amount(50, 600),
      type: "EXPENSE",
      date: monthDate(year, month, rng.int(1, 28)),
      description: rng.pick([
        "Kurs online Udemy",
        "Książki techniczne",
        "Konferencja IT",
        "Warsztaty programowania",
        "Szkolenie zawodowe",
        "Subskrypcja edukacyjna",
      ]),
      role: "education",
    });
  }

  const otherCount = rng.int(4, 7);
  for (let i = 0; i < otherCount; i++) {
    addTransaction(txs, map, {
      amount: rng.amount(40, 500),
      type: "EXPENSE",
      date: monthDate(year, month, rng.int(1, 28)),
      description: rng.pick([
        "Ubrania",
        "Prezent urodzinowy",
        "Fryzjer",
        "Kosmetyki",
        "Elektronika",
        "Wyposażenie domu",
        "Naprawy",
        "Kwiaty",
        "Usługi kurierskie",
      ]),
      role: "other",
    });
  }

  // --- distribute to every category by role (incl. user-added names) ---
  for (const [categoryId, role] of map.byId) {
    if (role === "salary" || role === "bonus") continue;

    const extraCount = rng.int(1, 3);
    for (let i = 0; i < extraCount; i++) {
      const descriptions: Record<CategoryRole, string[]> = {
        food: ["Przekąska", "Słodycze", "Dostawa jedzenia"],
        transport: ["Hulajnoga elektryczna", "Bilet autobusowy"],
        entertainment: ["Abonament gier", "Wynajem filmu"],
        health: ["Witaminy", "Masaż relaksacyjny"],
        housing: ["Środki czystości", "Żarówki LED"],
        education: ["Notatnik i materiały", "Webinar"],
        bonus: [],
        salary: [],
        other: ["Drobne zakupy", "Usługa domowa", "Przypadkowy wydatek"],
      };

      txs.push({
        amount: rng.amount(15, 200),
        type: "EXPENSE",
        date: monthDate(year, month, rng.int(1, 28)),
        description: rng.pick(descriptions[role]),
        categoryId,
      });
    }
  }

  if (isDecember) {
    for (let i = 0; i < rng.int(3, 6); i++) {
      addTransaction(txs, map, {
        amount: rng.amount(80, 400),
        type: "EXPENSE",
        date: monthDate(year, month, rng.int(10, 24)),
        description: rng.pick([
          "Prezent świąteczny",
          "Dekoracje świąteczne",
          "Wigilia - zakupy",
          "Choinka",
        ]),
        role: "other",
      });
    }
  }

  return txs;
}

async function main() {
  console.log("🌱 Adding transaction seed data (Jan 2025 – Jun 2026)...");

  const existingCategories = await db.select().from(categories);

  if (existingCategories.length === 0) {
    console.error("❌ No categories found. Create categories first or run pnpm seed.");
    process.exit(1);
  }

  console.log(`📂 Found ${existingCategories.length} categories:`);
  for (const cat of existingCategories) {
    console.log(`   • ${cat.name} → ${classifyCategory(cat.name)}`);
  }

  const catMap = buildCategoryMap(existingCategories);
  const rng = createRng(SEED);
  const allTransactions: TransactionDraft[] = [];

  const cursor = new Date(START_DATE);
  while (cursor <= END_DATE) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const monthTxs = generateMonthTransactions(year, month, catMap, rng);
    allTransactions.push(...monthTxs);
    console.log(
      `   ${year}-${String(month + 1).padStart(2, "0")}: ${monthTxs.length} transactions`,
    );
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (let i = 0; i < allTransactions.length; i += BATCH_SIZE) {
    const batch = allTransactions.slice(i, i + BATCH_SIZE);
    await db.insert(transactions).values(batch);
    console.log(
      `✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allTransactions.length / BATCH_SIZE)}`,
    );
  }

  const income = allTransactions.filter((t) => t.type === "INCOME").length;
  const expense = allTransactions.filter((t) => t.type === "EXPENSE").length;

  console.log("🎉 Seed completed (existing data preserved)!");
  console.log(`   Added transactions: ${allTransactions.length}`);
  console.log(`   Income: ${income} | Expense: ${expense}`);
  console.log(
    `   Avg per month: ${Math.round(allTransactions.length / 18)}`,
  );

  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error seeding transactions:", error);
  process.exit(1);
});
