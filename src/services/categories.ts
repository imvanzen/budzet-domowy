import db from "@/db";
import { categories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import type { Category, NewCategory } from "@/db/schema";

export async function getCategories(): Promise<Category[]> {
  return db.query.categories.findMany({
    orderBy: [asc(categories.name)],
  });
}

export async function getCategory(id: string): Promise<Category | undefined> {
  return db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
}

export async function createCategory(
  input: Omit<NewCategory, "id" | "createdAt" | "updatedAt">
): Promise<Category> {
  const [category] = await db
    .insert(categories)
    .values({
      ...input,
      updatedAt: new Date(),
    })
    .returning();

  return category;
}

export async function updateCategory(
  id: string,
  input: Partial<Omit<NewCategory, "id" | "createdAt" | "updatedAt">>
): Promise<Category> {
  const [category] = await db
    .update(categories)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning();

  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}
