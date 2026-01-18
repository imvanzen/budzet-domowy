import { beforeEach, afterEach } from "vitest";
import { setupTestDb, teardownTestDb } from "./test-db";

export type TestDbContext = Awaited<ReturnType<typeof setupTestDb>>;
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
