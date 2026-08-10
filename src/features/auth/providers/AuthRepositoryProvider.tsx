import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { FirebaseAuthRepository } from "@features/auth/infra/FirebaseAuthRepository";
import { IAuthRepository } from "@domain/auth/repositories/IAuthRepository";

const AuthRepositoryContext = createContext<IAuthRepository | null>(null);

export const AuthRepositoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const repository = useMemo(() => new FirebaseAuthRepository(), []);
  return (
    <AuthRepositoryContext.Provider value={repository}>
      {children}
    </AuthRepositoryContext.Provider>
  );
};

export function useAuthRepository(): IAuthRepository {
  const repository = useContext(AuthRepositoryContext);
  if (!repository) {
    throw new Error(
      "useAuthRepository must be used within AuthRepositoryProvider",
    );
  }
  return repository;
}
