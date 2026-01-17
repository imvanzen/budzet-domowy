"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { addCategory, editCategory } from "@/app/categories/actions";
import type { Category } from "@/db/schema";

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const isEditMode = !!category;

  const [name, setName] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || name.trim().length === 0) {
      setError("Nazwa kategorii jest wymagana");
      return;
    }

    if (name.length > 100) {
      setError("Nazwa nie może przekraczać 100 znaków");
      return;
    }

    startTransition(async () => {
      const result = isEditMode
        ? await editCategory(category.id, { name: name.trim() })
        : await addCategory({ name: name.trim() });

      if (result.success) {
        setSuccess(true);
        if (!isEditMode) {
          setName("");
        }
        setTimeout(() => {
          setSuccess(false);
          onSuccess?.();
        }, 1500);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Nazwa"
        value={name}
        onValueChange={setName}
        placeholder="Nazwa kategorii"
        description={`${name.length}/100 znaków`}
      />

      {error && (
        <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-50 p-3 text-sm text-success">
          {isEditMode
            ? "Kategoria została zaktualizowana!"
            : "Kategoria została dodana pomyślnie!"}
        </div>
      )}

      <div className="flex gap-2">
        {isEditMode && onCancel && (
          <Button variant="light" onPress={onCancel} className="flex-1">
            Anuluj
          </Button>
        )}
        <Button
          type="submit"
          color="primary"
          isLoading={isPending}
          className={isEditMode ? "flex-1" : "w-full"}
        >
          {isPending
            ? isEditMode
              ? "Zapisywanie..."
              : "Dodawanie..."
            : isEditMode
            ? "Zapisz"
            : "Dodaj Kategorię"}
        </Button>
      </div>
    </form>
  );
}
