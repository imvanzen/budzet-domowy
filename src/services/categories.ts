import db from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import type { Category } from "@/db/schema";

export async function getCategories(): Promise<Category[]> {
  return db.query.categories.findMany({
    orderBy: [asc(categories.name)],
  });
}
