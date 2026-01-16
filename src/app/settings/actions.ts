"use server";

import { updateSettings } from "@/services/settings";
import { revalidatePath } from "next/cache";
import type { Currency } from "@/db/schema";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function changeCurrency(currency: Currency): Promise<ActionResult> {
  try {
    await updateSettings(currency);
    revalidatePath("/settings");
    revalidatePath("/transactions");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas zmiany waluty",
    };
  }
}

