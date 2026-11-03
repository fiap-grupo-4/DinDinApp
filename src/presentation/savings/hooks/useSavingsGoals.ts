import { useCallback, useEffect, useState } from "react";
import { useAuthState } from "@features/auth/providers/AuthProvider";
import { useSavingsGoalRepository } from "@features/savings/providers/SavingsGoalRepositoryProvider";
import {
  createSavingsGoal,
  deleteSavingsGoal,
  listSavingsGoals,
  updateSavingsGoal,
} from "@domain/savings/use-cases/savingsGoalUseCases";
import {
  SavingsGoal,
  CreateSavingsGoalDTO,
  UpdateSavingsGoalDTO,
} from "@domain/savings/entities/SavingsGoal";

export function useSavingsGoals() {
  const repository = useSavingsGoalRepository();
  const { user } = useAuthState();

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    listSavingsGoals(repository, user.uid)
      .then(setGoals)
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar suas economias.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [repository, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addGoal = useCallback(
    async (data: Omit<CreateSavingsGoalDTO, "userId">) => {
      if (!user) return;
      const goal = await createSavingsGoal(repository, {
        ...data,
        userId: user.uid,
      });
      setGoals((current) => [goal, ...current]);
    },
    [repository, user],
  );

  const editGoal = useCallback(
    async (goalId: string, data: UpdateSavingsGoalDTO) => {
      await updateSavingsGoal(repository, goalId, data);
      setGoals((current) =>
        current.map((goal) =>
          goal.uid === goalId ? { ...goal, ...data } : goal,
        ),
      );
    },
    [repository],
  );

  const removeGoal = useCallback(
    async (goalId: string) => {
      await deleteSavingsGoal(repository, goalId);
      setGoals((current) => current.filter((goal) => goal.uid !== goalId));
    },
    [repository],
  );

  return { goals, isLoading, error, addGoal, editGoal, removeGoal, refresh };
}
