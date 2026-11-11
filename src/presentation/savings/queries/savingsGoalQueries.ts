import {
  queryOptions,
  type MutationOptions,
  type QueryClient,
} from "@tanstack/react-query";
import type {
  CreateSavingsGoalDTO,
  SavingsGoal,
  UpdateSavingsGoalDTO,
} from "@domain/savings/entities/SavingsGoal";
import type { ISavingsGoalRepository } from "@domain/savings/repositories/ISavingsGoalRepository";
import {
  createSavingsGoal,
  deleteSavingsGoal,
  listSavingsGoals,
  updateSavingsGoal,
} from "@application/savings/savingsGoalUseCases";
import {
  createOptimisticId,
  patchItem,
  prepareOptimisticUpdate,
  prependItem,
  removeItem,
  replaceItem,
  restoreSnapshot,
  type QuerySnapshot,
} from "@lib/queryCache/listCache";
import { queryKeys } from "@lib/queryCache/queryKeys";

export type NewSavingsGoal = Omit<CreateSavingsGoalDTO, "userId">;

export type EditSavingsGoalVariables = {
  goalId: string;
  data: UpdateSavingsGoalDTO;
};

type OptimisticContext = {
  snapshot: QuerySnapshot;
  optimisticId?: string;
};

type Clock = () => Date;

export function savingsGoalsQueryOptions(
  repository: ISavingsGoalRepository,
  userId: string,
) {
  return queryOptions({
    queryKey: queryKeys.savingsGoals.all(userId),
    queryFn: () => listSavingsGoals(repository, userId),
    enabled: !!userId,
  });
}

export function createSavingsGoalMutationOptions(
  queryClient: QueryClient,
  repository: ISavingsGoalRepository,
  userId: string,
  now: Clock = () => new Date(),
): MutationOptions<SavingsGoal, Error, NewSavingsGoal, OptimisticContext> {
  const queryKey = queryKeys.savingsGoals.all(userId);

  return {
    mutationFn: (data) => createSavingsGoal(repository, { ...data, userId }),
    onMutate: async (data) => {
      const snapshot = await prepareOptimisticUpdate(queryClient, queryKey);
      const optimistic: SavingsGoal = {
        ...data,
        userId,
        uid: createOptimisticId("goal"),
        createdAt: now().toISOString(),
      };
      queryClient.setQueryData<SavingsGoal[]>(queryKey, (goals) =>
        prependItem(goals, optimistic),
      );
      return { snapshot, optimisticId: optimistic.uid };
    },
    onError: (_error, _data, context) =>
      restoreSnapshot(queryClient, context?.snapshot),
    onSuccess: (created, _data, context) =>
      queryClient.setQueryData<SavingsGoal[]>(queryKey, (goals) =>
        context?.optimisticId
          ? replaceItem(goals, context.optimisticId, created)
          : prependItem(goals, created),
      ),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  };
}

export function updateSavingsGoalMutationOptions(
  queryClient: QueryClient,
  repository: ISavingsGoalRepository,
  userId: string,
): MutationOptions<
  UpdateSavingsGoalDTO,
  Error,
  EditSavingsGoalVariables,
  OptimisticContext
> {
  const queryKey = queryKeys.savingsGoals.all(userId);

  return {
    mutationFn: ({ goalId, data }) =>
      updateSavingsGoal(repository, userId, goalId, data),
    onMutate: async ({ goalId, data }) => {
      const snapshot = await prepareOptimisticUpdate(queryClient, queryKey);
      queryClient.setQueryData<SavingsGoal[]>(queryKey, (goals) =>
        patchItem(goals, goalId, data),
      );
      return { snapshot };
    },
    onError: (_error, _variables, context) =>
      restoreSnapshot(queryClient, context?.snapshot),
    onSuccess: (normalized, { goalId }) =>
      queryClient.setQueryData<SavingsGoal[]>(queryKey, (goals) =>
        patchItem(goals, goalId, normalized),
      ),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  };
}

export function deleteSavingsGoalMutationOptions(
  queryClient: QueryClient,
  repository: ISavingsGoalRepository,
  userId: string,
): MutationOptions<void, Error, string, OptimisticContext> {
  const queryKey = queryKeys.savingsGoals.all(userId);

  return {
    mutationFn: (goalId) => deleteSavingsGoal(repository, userId, goalId),
    onMutate: async (goalId) => {
      const snapshot = await prepareOptimisticUpdate(queryClient, queryKey);
      queryClient.setQueryData<SavingsGoal[]>(queryKey, (goals) =>
        removeItem(goals, goalId),
      );
      return { snapshot };
    },
    onError: (_error, _goalId, context) =>
      restoreSnapshot(queryClient, context?.snapshot),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  };
}
