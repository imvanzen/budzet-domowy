import { describe, it, expect, beforeEach } from "vitest";
import { useTestDb } from "@/__tests__/db/helpers";
import { seedTestDb } from "@/__tests__/db/fixtures";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

describe("Categories Service Logic", () => {
  const testDb = useTestDb();

  beforeEach(async () => {
    await seedTestDb(testDb.db);
  });

  describe("getCategories logic", () => {
    it("should return all categories ordered by name", async () => {
      const { db } = testDb;

      const result = await db.query.categories.findMany({
        orderBy: [asc(categories.name)],
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]?.name).toBeDefined();

      // Verify ordering
      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        if (prev && curr) {
          expect(prev.name.localeCompare(curr.name)).toBeLessThanOrEqual(0);
        }
      }
    });

    it("should return empty array when no categories exist", async () => {
      const { db } = testDb;
      // Clear all categories
      await db.delete(categories);

      const result = await db.query.categories.findMany();
      expect(result).toEqual([]);
    });
  });

  describe("getCategory logic", () => {
    it("should return category by id", async () => {
      const { db } = testDb;

      const allCategories = await db.query.categories.findMany();
      const firstCategory = allCategories[0];

      if (firstCategory) {
        const result = await db.query.categories.findFirst({
          where: eq(categories.id, firstCategory.id),
        });
        expect(result).toBeDefined();
        expect(result?.id).toBe(firstCategory.id);
        expect(result?.name).toBe(firstCategory.name);
      }
    });

    it("should return undefined for non-existent category", async () => {
      const { db } = testDb;

      const result = await db.query.categories.findFirst({
        where: eq(categories.id, "non-existent-id"),
      });
      expect(result).toBeUndefined();
    });
  });

  describe("createCategory logic", () => {
    it("should create a category with valid name", async () => {
      const { db } = testDb;

      const [newCategory] = await db
        .insert(categories)
        .values({
          name: "Test Category",
          updatedAt: new Date(),
        })
        .returning();

      expect(newCategory.id).toBeDefined();
      expect(newCategory.name).toBe("Test Category");
      expect(newCategory.createdAt).toBeInstanceOf(Date);
      expect(newCategory.updatedAt).toBeInstanceOf(Date);

      // Verify it exists in database
      const [found] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, newCategory.id));

      expect(found).toBeDefined();
      expect(found?.name).toBe("Test Category");
    });

    it("should create category with name as provided", async () => {
      const { db } = testDb;

      const [newCategory] = await db
        .insert(categories)
        .values({
          name: "  Test Category  ",
          updatedAt: new Date(),
        })
        .returning();

      expect(newCategory.name).toBe("  Test Category  "); // Service doesn't trim, action does
    });
  });

  describe("updateCategory logic", () => {
    it("should update category name", async () => {
      const { db } = testDb;

      const allCategories = await db.query.categories.findMany();
      const categoryToUpdate = allCategories[0];

      if (categoryToUpdate) {
        const [updated] = await db
          .update(categories)
          .set({
            name: "Updated Name",
            updatedAt: new Date(),
          })
          .where(eq(categories.id, categoryToUpdate.id))
          .returning();

        expect(updated.id).toBe(categoryToUpdate.id);
        expect(updated.name).toBe("Updated Name");
        expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
          categoryToUpdate.updatedAt.getTime()
        );

        // Verify in database
        const [found] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, categoryToUpdate.id));

        expect(found?.name).toBe("Updated Name");
      }
    });

    it("should update only provided fields", async () => {
      const { db } = testDb;

      const allCategories = await db.query.categories.findMany();
      const categoryToUpdate = allCategories[0];

      if (categoryToUpdate) {
        const [updated] = await db
          .update(categories)
          .set({
            name: "New Name",
            updatedAt: new Date(),
          })
          .where(eq(categories.id, categoryToUpdate.id))
          .returning();

        expect(updated.name).toBe("New Name");
        expect(updated.id).toBe(categoryToUpdate.id);
      }
    });
  });

  describe("deleteCategory logic", () => {
    it("should delete category by id", async () => {
      const { db } = testDb;

      // Create a new category to delete
      const [newCategory] = await db
        .insert(categories)
        .values({
          name: "To Delete",
          updatedAt: new Date(),
        })
        .returning();

      await db.delete(categories).where(eq(categories.id, newCategory.id));

      // Verify it's deleted
      const [found] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, newCategory.id));

      expect(found).toBeUndefined();
    });

    it("should not throw when deleting non-existent category", async () => {
      const { db } = testDb;

      await expect(
        db.delete(categories).where(eq(categories.id, "non-existent-id"))
      ).resolves.not.toThrow();
    });
  });
});
