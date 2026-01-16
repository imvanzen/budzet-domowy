import { Suspense } from "react";
import { getCategories } from "@/services/categories";
import { CategoriesManager } from "@/components/categories/CategoriesManager";

async function CategoriesContent() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kategorie</h1>
      </div>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-6xl p-6">
          <div className="text-center">Ładowanie...</div>
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}

