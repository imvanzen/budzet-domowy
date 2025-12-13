import { beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb } from "./test-db";

/**
 * Test context for database operations.
 * Use this in tests that need database access.
 */
export type TestDbContext = Awaited<ReturnType<typeof setupTestDb>>;

/**
 * Sets up a clean database before each test.
 * Returns the database instance and cleanup function.
 *
 * @example
 * ```ts
 * const { db, cleanup } = useTestDb();
 *
 * test("my test", async () => {
 *   // Use db here
 * });
 *
 * afterEach(cleanup);
 * ```
 */
export function useTestDb() {
  let db: Awaited<TestDbContext>["db"] | null = null;
  let client: Awaited<TestDbContext>["client"] | null = null;

  beforeEach(async () => {
    const result = await setupTestDb();
    db = result.db;
    client = result.client;
  });

  afterEach(async () => {
    if (client) {
      await teardownTestDb(client);
      db = null;
      client = null;
    }
  });

  return {
    get db() {
      if (!db) {
        throw new Error(
          "Database not initialized. Make sure to call useTestDb() before using db."
        );
      }
      return db;
    },
  };
}
