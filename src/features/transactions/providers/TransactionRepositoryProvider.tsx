import React, { createContext, useContext } from "react";
import { FirebaseTransactionRepository } from "@features/transactions/infra/FirebaseTransactionRepository";
import { ITransactionRepository } from "@domain/transactions/repositories/ITransactionRepository";

const TransactionRepositoryContext =
  createContext<ITransactionRepository | null>(null);

export const TransactionRepositoryProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const repository = new FirebaseTransactionRepository();

  return (
    <TransactionRepositoryContext.Provider value={repository}>
      {children}
    </TransactionRepositoryContext.Provider>
  );
};

export function useTransactionRepository(): ITransactionRepository {
  const repository = useContext(TransactionRepositoryContext);
  if (!repository) {
    throw new Error(
      "useTransactionRepository must be used within a TransactionRepositoryProvider",
    );
  }
  return repository;
}
