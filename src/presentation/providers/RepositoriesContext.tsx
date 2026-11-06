import { createContext, useContext } from "react";
import type { Observable } from "rxjs";
import type { IAuthRepository } from "@domain/auth/repositories/IAuthRepository";
import type { ICategoryRepository } from "@domain/categories/repositories/ICategoryRepository";
import type { ISavingsGoalRepository } from "@domain/savings/repositories/ISavingsGoalRepository";
import type { IReceiptStorage } from "@domain/transactions/repositories/IReceiptStorage";
import type { ITransactionRepository } from "@domain/transactions/repositories/ITransactionRepository";
import type { TransactionChange } from "@domain/transactions/events/TransactionChange";

export type Repositories = {
  auth: IAuthRepository;
  categories: ICategoryRepository;
  transactions: ITransactionRepository;
  transactionChanges: Observable<TransactionChange>;
  savingsGoals: ISavingsGoalRepository;
  receiptStorage: IReceiptStorage;
};

export const RepositoriesContext = createContext<Repositories | null>(null);

export function useRepositories(): Repositories {
  const repositories = useContext(RepositoriesContext);
  if (!repositories) {
    throw new Error(
      "useRepositories must be used within AppRepositoriesProvider",
    );
  }
  return repositories;
}
