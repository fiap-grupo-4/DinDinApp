import { useCallback, useEffect, useRef, useState } from "react";
import { getSafeErrorMessage } from "@lib/error-messages";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import { useRepositories } from "@presentation/providers/RepositoriesContext";
import {
  createSavingsGoal,
  deleteSavingsGoal,
  listSavingsGoals,
  updateSavingsGoal,
} from "@application/savings/savingsGoalUseCases";
import {
  SavingsGoal,
  CreateSavingsGoalDTO,
  UpdateSavingsGoalDTO,
} from "@domain/savings/entities/SavingsGoal";

export function useSavingsGoals() {
  const { savingsGoals: repository } = useRepositories();
  const { user } = useAuthState();

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestVersionRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;

    if (!user) {
      setGoals([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await listSavingsGoals(repository, user.uid);
      if (requestVersion !== requestVersionRef.current) return;
      setGoals(result);
    } catch (err) {
      if (requestVersion !== requestVersionRef.current) return;
      setError(
        getSafeErrorMessage(err, "Não foi possível carregar suas economias."),
      );
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setIsLoading(false);
      }
    }
  }, [repository, user]);

  useEffect(() => {
    void refresh();
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
      if (!user) return;
      const patch = await updateSavingsGoal(
        repository,
        user.uid,
        goalId,
        data,
      );
      setGoals((current) =>
        current.map((goal) =>
          goal.uid === goalId ? { ...goal, ...patch } : goal,
        ),
      );
    },
    [repository, user],
  );

  const removeGoal = useCallback(
    async (goalId: string) => {
      if (!user) return;
      await deleteSavingsGoal(repository, user.uid, goalId);
      setGoals((current) => current.filter((goal) => goal.uid !== goalId));
    },
    [repository, user],
  );

  return { goals, isLoading, error, addGoal, editGoal, removeGoal, refresh };
}
