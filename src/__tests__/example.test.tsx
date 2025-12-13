import { describe, it, expect } from "vitest";
import { render, screen } from "./test-utils";
import { useTestDb } from "./db/helpers";
import { seedTestDb } from "./db/fixtures";
import { categories, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Example test showing how to use the test database
describe("Example: Database Tests", () => {
  const testDb = useTestDb();

  it("should create and query categories", async () => {
    const { db } = testDb;
    await db.insert(categories).values({
      id: "test-cat-1",
      name: "Test Category",
    });

    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, "test-cat-1"));

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Test Category");
  });

  it("should use fixtures to seed data", async () => {
    const { db } = testDb;
    await seedTestDb(db);

    const allCategories = await db.select().from(categories);
    expect(allCategories.length).toBeGreaterThan(0);

    const allTransactions = await db.select().from(transactions);
    expect(allTransactions.length).toBeGreaterThan(0);
  });
});

// Example test showing how to test React components
describe("Example: Component Tests", () => {
  it("should render with providers", () => {
    render(<div>Test Content</div>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});
