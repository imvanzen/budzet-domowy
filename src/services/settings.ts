import db from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Settings, Currency } from "@/db/schema";

export async function getSettings(): Promise<Settings> {
  let result = await db.query.settings.findFirst({
    where: (s, { eq }) => eq(s.id, "singleton"),
  });

  if (!result) {
    // Create default settings if not exists
    const [created] = await db
      .insert(settings)
      .values({
        id: "singleton",
        currency: "PLN",
      })
      .returning();
    result = created;
  }

  return result;
}

export async function updateSettings(currency: Currency): Promise<Settings> {
  const [updated] = await db
    .update(settings)
    .set({ currency })
    .where(eq(settings.id, "singleton"))
    .returning();

  return updated;
}

