import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { FirebaseSavingsGoalRepository } from "@features/savings/infra/FirebaseSavingsGoalRepository";
import { ISavingsGoalRepository } from "@domain/savings/repositories/ISavingsGoalRepository";

const SavingsGoalRepositoryContext =
  createContext<ISavingsGoalRepository | null>(null);

export const SavingsGoalRepositoryProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const repository = useMemo(() => new FirebaseSavingsGoalRepository(), []);

  return (
    <SavingsGoalRepositoryContext.Provider value={repository}>
      {children}
    </SavingsGoalRepositoryContext.Provider>
  );
};

export function useSavingsGoalRepository(): ISavingsGoalRepository {
  const repository = useContext(SavingsGoalRepositoryContext);
  if (!repository) {
    throw new Error(
      "useSavingsGoalRepository must be used within a SavingsGoalRepositoryProvider",
    );
  }
  return repository;
}
