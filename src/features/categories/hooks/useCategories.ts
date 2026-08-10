import { useEffect, useState } from "react";
import { useCategoryRepository } from "@features/categories/providers/CategoryRepositoryProvider";
import {
  createCategory,
  listCategories,
} from "@domain/categories/use-cases/categoryUseCases";
import {
  Category,
  CreateCategoryDTO,
} from "@domain/categories/entities/Category";

export function useCategories(userId: string) {
  const repository = useCategoryRepository();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listCategories(repository, userId)
      .then(setCategories)
      .catch((err) =>
        setError((err as Error).message || "Erro ao carregar categorias."),
      )
      .finally(() => setLoading(false));
  }, [repository, userId]);

  const addCategory = async (data: CreateCategoryDTO) => {
    setLoading(true);
    setError(null);
    try {
      const category = await createCategory(repository, data);
      setCategories((prev) => [...prev, category]);
      return category;
    } catch (err) {
      setError((err as Error).message || "Erro ao criar categoria.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, addCategory };
}
