"use server";

import { createCategory, updateCategory, deleteCategory } from "@/services/categories";
import { revalidatePath } from "next/cache";
import type { NewCategory } from "@/db/schema";

export type ActionResult =
  | { success: true; data?: { id: string } }
  | { success: false; error: string };

export async function addCategory(
  input: Omit<NewCategory, "id" | "createdAt" | "updatedAt">
): Promise<ActionResult> {
  try {
    if (!input.name || input.name.trim().length === 0) {
      return { success: false, error: "Nazwa kategorii jest wymagana" };
    }

    if (input.name.length > 100) {
      return { success: false, error: "Nazwa nie może przekraczać 100 znaków" };
    }

    const category = await createCategory(input);
    revalidatePath("/categories");

    return { success: true, data: { id: category.id } };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas dodawania kategorii",
    };
  }
}

export async function editCategory(
  id: string,
  input: Partial<Omit<NewCategory, "id" | "createdAt" | "updatedAt">>
): Promise<ActionResult> {
  try {
    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        return { success: false, error: "Nazwa kategorii jest wymagana" };
      }

      if (input.name.length > 100) {
        return { success: false, error: "Nazwa nie może przekraczać 100 znaków" };
      }
    }

    await updateCategory(id, input);
    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas edycji kategorii",
    };
  }
}

export async function removeCategory(id: string): Promise<ActionResult> {
  try {
    await deleteCategory(id);
    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: "Wystąpił błąd podczas usuwania kategorii",
    };
  }
}

