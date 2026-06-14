"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { HiPlusCircle, HiQueueList } from "react-icons/hi2";
import { CategoryForm } from "./CategoryForm";
import { CategoryList } from "./CategoryList";
import type { Category } from "@/db/schema";

type CategoriesManagerProps = {
  initialCategories: Category[];
};

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSuccess = () => {
    setEditingCategory(null);
  };

  const handleCancel = () => {
    setEditingCategory(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader className="flex items-center gap-2">
          <HiPlusCircle className="text-xl text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">
            {editingCategory ? "Edytuj kategorię" : "Dodaj Kategorię"}
          </h2>
        </CardHeader>
        <CardBody>
          <CategoryForm
            category={editingCategory || undefined}
            onSuccess={handleSuccess}
            onCancel={editingCategory ? handleCancel : undefined}
          />
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex items-center gap-2">
          <HiQueueList className="text-xl text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">Lista Kategorii</h2>
        </CardHeader>
        <CardBody>
          <CategoryList categories={initialCategories} onEdit={handleEdit} />
        </CardBody>
      </Card>
    </div>
  );
}

