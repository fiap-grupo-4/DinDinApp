import React, { createContext, useContext } from "react";
import type { Observable } from "rxjs";
import { FirebaseTransactionRepository } from "@features/transactions/infra/FirebaseTransactionRepository";
import { ObservableTransactionRepository } from "@features/transactions/infra/ObservableTransactionRepository";
import { ITransactionRepository } from "@domain/transactions/repositories/ITransactionRepository";
import { TransactionChange } from "@domain/transactions/events/TransactionChange";

const sharedRepository = new ObservableTransactionRepository(
  new FirebaseTransactionRepository(),
);

const TransactionRepositoryContext =
  createContext<ObservableTransactionRepository | null>(null);

export const TransactionRepositoryProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <TransactionRepositoryContext.Provider value={sharedRepository}>
      {children}
    </TransactionRepositoryContext.Provider>
  );
};

function useObservableTransactionRepository() {
  const repository = useContext(TransactionRepositoryContext);
  if (!repository) {
    throw new Error(
      "useTransactionRepository must be used within a TransactionRepositoryProvider",
    );
  }
  return repository;
}

export function useTransactionRepository(): ITransactionRepository {
  return useObservableTransactionRepository();
}

export function useTransactionChanges(): Observable<TransactionChange> {
  return useObservableTransactionRepository().changes$;
}
