"use server";

import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getPaginatedTransactions,
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
  type TransactionFilters,
  type TransactionWithCategory,
} from "@/services/transactions";
import { revalidatePath } from "next/cache";
import type { NewTransaction } from "@/db/schema";
import type { ActionResult } from "@/types/actions";

function validateTransaction(input: {
  amount?: number;
  date?: Date;
  description?: string | null;
}): string | null {
  if (input.amount !== undefined && input.amount <= 0) {
    return "Kwota musi być większa od 0";
  }

  if (input.date) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (input.date > today) {
      return "Data nie może być z przyszłości";
    }
  }

  if (input.description && input.description.length > 500) {
    return "Opis nie może przekraczać 500 znaków";
  }

  return null;
}

export async function addTransaction(
  input: Omit<NewTransaction, "id" | "createdAt" | "updatedAt">,
): Promise<ActionResult<{ id: string }>> {
  try {
    const error = validateTransaction(input);
    if (error) {
      return { success: false, error };
    }

    const transaction = await createTransaction(input);
    revalidatePath("/transactions");
    revalidatePath("/transactions/new");
    revalidatePath(`/transactions/${transaction.id}/edit`);
    revalidatePath("/");

    return { success: true, data: { id: transaction.id } };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas dodawania transakcji",
    };
  }
}

export async function editTransaction(
  id: string,
  input: Partial<Omit<NewTransaction, "id" | "createdAt" | "updatedAt">>,
): Promise<ActionResult> {
  try {
    const error = validateTransaction(input);
    if (error) {
      return { success: false, error };
    }

    await updateTransaction(id, input);
    revalidatePath("/transactions");
    revalidatePath("/transactions/new");
    revalidatePath(`/transactions/${id}/edit`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas edycji transakcji",
    };
  }
}

export async function removeTransaction(id: string): Promise<ActionResult> {
  try {
    await deleteTransaction(id);
    revalidatePath("/transactions");
    revalidatePath("/transactions/new");
    revalidatePath(`/transactions/${id}/edit`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas usuwania transakcji",
    };
  }
}

export async function getFilteredTransactions(
  filters?: TransactionFilters,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<TransactionWithCategory>> {
  return getPaginatedTransactions(filters, page, pageSize);
}
