"use server";

import { createTransaction } from "@/services/transactions";
import { revalidatePath } from "next/cache";
import type { NewTransaction } from "@/db/schema";

export type CreateTransactionResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string };

export async function addTransaction(
  input: Omit<NewTransaction, "id" | "createdAt" | "updatedAt">
): Promise<CreateTransactionResult> {
  try {
    // Server-side validation
    if (input.amount <= 0) {
      return { success: false, error: "Kwota musi być większa od 0" };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (input.date > today) {
      return { success: false, error: "Data nie może być z przyszłości" };
    }

    if (input.description && input.description.length > 500) {
      return {
        success: false,
        error: "Opis nie może przekraczać 500 znaków",
      };
    }

    const transaction = await createTransaction(input);

    revalidatePath("/transactions");

    return { success: true, data: { id: transaction.id } };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas dodawania transakcji",
    };
  }
}
