import { Suspense } from "react";
import { HiTag } from "react-icons/hi2";
import { CategoriesManager } from "@/components/categories/CategoriesManager";
import { CategoriesSkeleton } from "@/components/skeletons/CategoriesSkeleton";
import { getCategories } from "@/services/categories";

async function CategoriesContent() {
  const categories = await getCategories();

  return <CategoriesManager initialCategories={categories} />;
}

export default function CategoriesPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <HiTag className="text-primary" aria-hidden />
          Kategorie
        </h1>
      </div>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
