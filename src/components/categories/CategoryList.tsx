"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import type { Category } from "@/db/schema";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { removeCategory } from "@/app/categories/actions";

interface CategoryListProps {
  categories: Category[];
  onEdit?: (category: Category) => void;
}

export function CategoryList({ categories, onEdit }: CategoryListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    await removeCategory(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
  };

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-default-200 p-8 text-center">
        <p className="text-default-500">Brak kategorii</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-default-200 p-4"
          >
            <div className="flex-1">
              <p className="font-medium">{category.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button size="sm" variant="light" onPress={() => onEdit(category)}>
                  Edytuj
                </Button>
              )}
              <Button
                size="sm"
                color="danger"
                variant="light"
                onPress={() => setDeleteId(category.id)}
              >
                Usuń
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Usuń kategorię"
        message="Czy na pewno chcesz usunąć tę kategorię? Transakcje z tą kategorią staną się bez kategorii."
        confirmText="Usuń"
        cancelText="Anuluj"
        isDanger
      />
    </>
  );
}

