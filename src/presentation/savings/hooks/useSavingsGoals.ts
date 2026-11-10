import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSafeErrorMessage } from "@lib/error-messages";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import { useRepositories } from "@presentation/providers/RepositoriesContext";
import {
  createSavingsGoalMutationOptions,
  deleteSavingsGoalMutationOptions,
  type NewSavingsGoal,
  savingsGoalsQueryOptions,
  updateSavingsGoalMutationOptions,
} from "@presentation/savings/queries/savingsGoalQueries";
import {
  SavingsGoal,
  UpdateSavingsGoalDTO,
} from "@domain/savings/entities/SavingsGoal";

const EMPTY: SavingsGoal[] = [];

export function useSavingsGoals() {
  const { savingsGoals: repository } = useRepositories();
  const { user } = useAuthState();
  const userId = user?.uid ?? "";
  const queryClient = useQueryClient();

  const query = useQuery(savingsGoalsQueryOptions(repository, userId));

  const { mutateAsync: create } = useMutation(
    createSavingsGoalMutationOptions(queryClient, repository, userId),
  );
  const { mutateAsync: update } = useMutation(
    updateSavingsGoalMutationOptions(queryClient, repository, userId),
  );
  const { mutateAsync: remove } = useMutation(
    deleteSavingsGoalMutationOptions(queryClient, repository, userId),
  );

  const addGoal = useCallback(
    async (data: NewSavingsGoal) => {
      if (!userId) return;
      await create(data);
    },
    [create, userId],
  );

  const editGoal = useCallback(
    async (goalId: string, data: UpdateSavingsGoalDTO) => {
      if (!userId) return;
      await update({ goalId, data });
    },
    [update, userId],
  );

  const removeGoal = useCallback(
    async (goalId: string) => {
      if (!userId) return;
      await remove(goalId);
    },
    [remove, userId],
  );

  const { refetch } = query;
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    goals: query.data ?? EMPTY,
    isLoading: !!userId && query.isPending,
    error: query.error
      ? getSafeErrorMessage(
          query.error,
          "Não foi possível carregar suas economias.",
        )
      : null,
    addGoal,
    editGoal,
    removeGoal,
    refresh,
  };
}
