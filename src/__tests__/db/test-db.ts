import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@/db/schema";

/**
 * Creates an isolated in-memory database for testing.
 * Each test gets a fresh database instance.
 */
export function createTestDb() {
  // Use in-memory SQLite for fast, isolated tests
  const client = createClient({
    url: ":memory:",
  });

  const db = drizzle(client, { schema });

  return { db, client };
}

/**
 * Sets up a test database with schema migrations.
 * Call this in beforeEach to ensure clean state.
 */
export async function setupTestDb() {
  const { db, client } = createTestDb();

  // Create tables manually (faster than migrations for tests)
  // Use client.execute for raw SQL
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

/**
 * Cleans up test database by closing the connection.
 */
export async function teardownTestDb(client: ReturnType<typeof createClient>) {
  await client.close();
}
