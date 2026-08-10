import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { FirebaseCategoryRepository } from "@features/categories/infra/FirebaseCategoryRepository";
import { ICategoryRepository } from "@domain/categories/repositories/ICategoryRepository";

const CategoryRepositoryContext = createContext<ICategoryRepository | null>(
  null,
);

export const CategoryRepositoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const repository = useMemo(() => new FirebaseCategoryRepository(), []);

  return (
    <CategoryRepositoryContext.Provider value={repository}>
      {children}
    </CategoryRepositoryContext.Provider>
  );
};

export function useCategoryRepository(): ICategoryRepository {
  const repository = useContext(CategoryRepositoryContext);
  if (!repository) {
    throw new Error(
      "useCategoryRepository must be used within CategoryRepositoryProvider",
    );
  }
  return repository;
}
