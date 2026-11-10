import {
  queryOptions,
  type MutationOptions,
  type QueryClient,
} from "@tanstack/react-query";
import type {
  Category,
  CreateCategoryDTO,
} from "@domain/categories/entities/Category";
import type { ICategoryRepository } from "@domain/categories/repositories/ICategoryRepository";
import {
  createCategory,
  listCategories,
} from "@application/categories/categoryUseCases";
import {
  appendItem,
  createOptimisticId,
  prepareOptimisticUpdate,
  replaceItem,
  restoreSnapshot,
  type QuerySnapshot,
} from "@presentation/query/listCache";
import { CATEGORIES_STALE_TIME } from "@presentation/query/queryClient";
import { queryKeys } from "@presentation/query/queryKeys";

type OptimisticContext = {
  snapshot: QuerySnapshot;
  optimisticId: string;
};

type Clock = () => Date;

export function categoriesQueryOptions(
  repository: ICategoryRepository,
  userId: string,
) {
  return queryOptions({
    queryKey: queryKeys.categories.all(userId),
    queryFn: () => listCategories(repository, userId),
    staleTime: CATEGORIES_STALE_TIME,
    enabled: !!userId,
  });
}

export function createCategoryMutationOptions(
  queryClient: QueryClient,
  repository: ICategoryRepository,
  now: Clock = () => new Date(),
): MutationOptions<Category, Error, CreateCategoryDTO, OptimisticContext> {
  return {
    mutationFn: (data) => createCategory(repository, data),
    onMutate: async (data) => {
      const queryKey = queryKeys.categories.all(data.userId);
      const snapshot = await prepareOptimisticUpdate(queryClient, queryKey);
      const optimistic: Category = {
        ...data,
        uid: createOptimisticId("category"),
        createdAt: now().toISOString(),
      };
      queryClient.setQueryData<Category[]>(queryKey, (categories) =>
        appendItem(categories, optimistic),
      );
      return { snapshot, optimisticId: optimistic.uid };
    },
    onError: (_error, _data, context) =>
      restoreSnapshot(queryClient, context?.snapshot),
    onSuccess: (created, data, context) =>
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.all(data.userId),
        (categories) =>
          context
            ? replaceItem(categories, context.optimisticId, created)
            : appendItem(categories, created),
      ),
    onSettled: (_created, _error, data) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all(data.userId),
      });
    },
  };
}
