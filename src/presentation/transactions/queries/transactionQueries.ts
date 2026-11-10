import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import type { Transaction } from "@domain/transactions/entities/Transaction";
import { getDayRange } from "@domain/transactions/services/transaction-filters";
import {
  listTransactions,
  type TransactionUseCaseDeps,
} from "@application/transactions/transactionUseCases";
import {
  queryKeys,
  type TransactionServerFilters,
} from "@presentation/query/queryKeys";
import type {
  TransactionPage,
  TransactionPageParam,
} from "./transactionCache";

export const TRANSACTIONS_PAGE_SIZE = 25;

type ListDeps = Pick<TransactionUseCaseDeps, "transactions">;

export function transactionListQueryOptions(
  deps: ListDeps,
  userId: string,
  filters: TransactionServerFilters,
) {
  return infiniteQueryOptions({
    queryKey: queryKeys.transactions.list(userId, filters),
    queryFn: ({ pageParam }): Promise<TransactionPage> =>
      listTransactions(deps, userId, {
        limit: TRANSACTIONS_PAGE_SIZE,
        startAfter: pageParam ?? undefined,
        transactionType: filters.transactionType,
        categoryId: filters.categoryId,
        ...getDayRange(filters.date),
      }),
    initialPageParam: null as TransactionPageParam,
    getNextPageParam: (lastPage): TransactionPageParam | undefined =>
      lastPage.nextCursor ?? undefined,
    enabled: !!userId,
  });
}

// Histórico completo, usado pelos cálculos do dashboard (saldo, evolução mensal).
export function transactionHistoryQueryOptions(deps: ListDeps, userId: string) {
  return queryOptions({
    queryKey: queryKeys.transactions.history(userId),
    queryFn: async (): Promise<Transaction[]> =>
      (await listTransactions(deps, userId)).data,
    enabled: !!userId,
  });
}
