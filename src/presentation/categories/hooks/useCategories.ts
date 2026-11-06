import { useEffect, useState } from "react";
import { getSafeErrorMessage } from "@lib/error-messages";
import { useRepositories } from "@presentation/providers/RepositoriesContext";
import {
  createCategory,
  listCategories,
} from "@application/categories/categoryUseCases";
import {
  Category,
  CreateCategoryDTO,
} from "@domain/categories/entities/Category";

export function useCategories(userId: string) {
  const { categories: repository } = useRepositories();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setCategories([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    listCategories(repository, userId)
      .then(setCategories)
      .catch((err) =>
        setError(
          getSafeErrorMessage(err, "Não foi possível carregar categorias."),
        ),
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
      setError(
        getSafeErrorMessage(err, "Não foi possível criar a categoria."),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, addCategory };
}
