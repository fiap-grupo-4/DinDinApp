import { useCallback, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { filterTransactions } from "@domain/transactions/services/transaction-filters";
import { getSafeErrorMessage } from "@lib/error-messages";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import { useRepositories } from "@presentation/providers/RepositoriesContext";
import { flattenTransactionPages } from "@presentation/transactions/queries/transactionCache";
import { transactionListQueryOptions } from "@presentation/transactions/queries/transactionQueries";
import {
  selectTransactionFilters,
  useTransactionFiltersStore,
} from "@presentation/transactions/stores/transactionFiltersStore";
import { useTransactionMutations } from "./useTransactionMutations";

// Lista paginada da tela de transações. Os filtros vêm da store de UI; tipo,
// categoria e data vão para o servidor (e para a chave do cache), a busca por
// texto é aplicada em memória sobre as páginas já carregadas.
export function useTransactions() {
  const { transactions: transactionRepository } = useRepositories();
  const { user } = useAuthState();
  const userId = user?.uid ?? "";
  const filters = useTransactionFiltersStore(selectTransactionFilters);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const query = useInfiniteQuery(
    transactionListQueryOptions(
      { transactions: transactionRepository },
      userId,
      filters,
    ),
  );
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    query;

  const transactions = useMemo(
    () => filterTransactions(flattenTransactionPages(data), filters),
    [data, filters],
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const error = query.error
    ? getSafeErrorMessage(
        query.error,
        query.isFetchNextPageError
          ? "Não foi possível carregar mais transações."
          : "Não foi possível carregar transações.",
      )
    : null;

  return {
    transactions,
    isLoading: !!userId && query.isPending,
    isRefreshing,
    isLoadingMore: isFetchingNextPage,
    hasMore: hasNextPage,
    error,
    refresh,
    loadMore,
    ...useTransactionMutations(),
  };
}
