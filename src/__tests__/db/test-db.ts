import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@/db/schema";

export function createTestDb() {
  const client = createClient({
    url: ":memory:",
  });

  const db = drizzle(client, { schema });

  return { db, client };
}

export async function setupTestDb() {
  const { db, client } = createTestDb();

  await client.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      date INTEGER NOT NULL,
      description TEXT,
      category_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'singleton',
      currency TEXT NOT NULL DEFAULT 'PLN'
    )
  `);

  return { db, client };
}

export async function teardownTestDb(client: ReturnType<typeof createClient>) {
  await client.close();
}
