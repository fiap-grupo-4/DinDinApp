import { ReactNode } from "react";
import { FirebaseAuthRepository } from "@infra/firebase/repositories/FirebaseAuthRepository";
import { FirebaseCategoryRepository } from "@infra/firebase/repositories/FirebaseCategoryRepository";
import { FirebaseSavingsGoalRepository } from "@infra/firebase/repositories/FirebaseSavingsGoalRepository";
import { FirebaseTransactionRepository } from "@infra/firebase/repositories/FirebaseTransactionRepository";
import { FirebaseReceiptStorage } from "@infra/firebase/storage/FirebaseReceiptStorage";
import { ObservableTransactionRepository } from "@infra/reactive/ObservableTransactionRepository";
import {
  Repositories,
  RepositoriesContext,
} from "@presentation/providers/RepositoriesContext";

let defaultRepositories: Repositories | null = null;

function getDefaultRepositories(): Repositories {
  if (!defaultRepositories) {
    const transactions = new ObservableTransactionRepository(
      new FirebaseTransactionRepository(),
    );
    defaultRepositories = {
      auth: new FirebaseAuthRepository(),
      categories: new FirebaseCategoryRepository(),
      transactions,
      transactionChanges: transactions.changes$,
      savingsGoals: new FirebaseSavingsGoalRepository(),
      receiptStorage: new FirebaseReceiptStorage(),
    };
  }
  return defaultRepositories;
}

export function AppRepositoriesProvider({
  children,
  repositories,
}: {
  children: ReactNode;
  repositories?: Repositories;
}) {
  return (
    <RepositoriesContext.Provider
      value={repositories ?? getDefaultRepositories()}
    >
      {children}
    </RepositoriesContext.Provider>
  );
}
