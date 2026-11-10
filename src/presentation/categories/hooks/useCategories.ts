import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSafeErrorMessage } from "@lib/error-messages";
import { useRepositories } from "@presentation/providers/RepositoriesContext";
import {
  categoriesQueryOptions,
  createCategoryMutationOptions,
} from "@presentation/categories/queries/categoryQueries";
import {
  Category,
  CreateCategoryDTO,
} from "@domain/categories/entities/Category";

const EMPTY: Category[] = [];

export function useCategories(userId: string) {
  const { categories: repository } = useRepositories();
  const queryClient = useQueryClient();

  const query = useQuery(categoriesQueryOptions(repository, userId));
  const mutation = useMutation(
    createCategoryMutationOptions(queryClient, repository),
  );
  const { mutateAsync } = mutation;

  const addCategory = useCallback(
    (data: CreateCategoryDTO) => mutateAsync(data),
    [mutateAsync],
  );

  const queryError = query.error
    ? getSafeErrorMessage(query.error, "Não foi possível carregar categorias.")
    : null;
  const mutationError = mutation.error
    ? getSafeErrorMessage(mutation.error, "Não foi possível criar a categoria.")
    : null;

  return {
    categories: query.data ?? EMPTY,
    loading: (!!userId && query.isPending) || mutation.isPending,
    error: mutationError ?? queryError,
    addCategory,
  };
}
