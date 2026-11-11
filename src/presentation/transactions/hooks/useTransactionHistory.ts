import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@domain/transactions/entities/Transaction";
import { getSafeErrorMessage } from "@lib/error-messages";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import { useRepositories } from "@presentation/providers/RepositoriesContext";
import { transactionHistoryQueryOptions } from "@presentation/transactions/queries/transactionQueries";
import { useTransactionMutations } from "./useTransactionMutations";

const EMPTY: Transaction[] = [];

// Histórico completo de transações, base dos cálculos do dashboard.
export function useTransactionHistory() {
  const { transactions: transactionRepository } = useRepositories();
  const { user } = useAuthState();
  const userId = user?.uid ?? "";

  const query = useQuery(
    transactionHistoryQueryOptions(
      { transactions: transactionRepository },
      userId,
    ),
  );

  return {
    transactions: query.data ?? EMPTY,
    isLoading: !!userId && query.isPending,
    error: query.error
      ? getSafeErrorMessage(query.error, "Não foi possível carregar transações.")
      : null,
    refresh: query.refetch,
    ...useTransactionMutations(),
  };
}
