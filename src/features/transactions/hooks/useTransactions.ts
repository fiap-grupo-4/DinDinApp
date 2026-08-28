import {
  CreateTransactionDTO,
  Transaction,
  UpdateTransactionDTO,
} from "@domain/transactions/entities/Transaction";
import type {
  TransactionCursor,
  TransactionFilters,
} from "@domain/transactions/repositories/ITransactionRepository";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "@domain/transactions/use-cases/transactionUseCases";
import { useAuthState } from "@features/auth/providers/AuthProvider";
import { useTransactionRepository } from "@features/transactions/providers/TransactionRepositoryProvider";
import { TransactionFiltersValue } from "@features/transactions/ui/transaction-filters-drawer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const LIST_LIMIT = 25;

type UseTransactionsOptions = {
  limit?: number | null;
};

function getDateRange(dateValue?: string) {
  if (!dateValue) return {};

  const selectedDate = new Date(dateValue);
  if (Number.isNaN(selectedDate.getTime())) return {};

  const start = new Date(selectedDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
  };
}

export function useTransactions(
  filters: TransactionFiltersValue,
  options?: UseTransactionsOptions,
) {
  const repository = useTransactionRepository();
  const { user } = useAuthState();
  const listLimit =
    options?.limit === null ? undefined : (options?.limit ?? LIST_LIMIT);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<TransactionCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);
  const isLoadingMoreRef = useRef(false);

  const buildRepositoryFilters = useCallback(
    (startAfter?: TransactionCursor): TransactionFilters | undefined => {
      if (listLimit === undefined) return undefined;

      return {
        limit: listLimit,
        startAfter,
        transactionType: filters.transactionType,
        categoryId: filters.categoryId,
        ...getDateRange(filters.date),
      };
    },
    [filters.categoryId, filters.date, filters.transactionType, listLimit],
  );

  const refresh = useCallback(async () => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    isLoadingMoreRef.current = false;

    if (!user) {
      setTransactions([]);
      setNextCursor(null);
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsLoadingMore(false);
    setError(null);

    try {
      const result = await listTransactions(
        repository,
        user.uid,
        buildRepositoryFilters(),
      );

      if (requestVersion !== requestVersionRef.current) return;

      setTransactions(result.data);
      setNextCursor(result.nextCursor ?? null);
      setHasMore(result.nextCursor != null);
    } catch (err) {
      if (requestVersion !== requestVersionRef.current) return;

      setNextCursor(null);
      setHasMore(false);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar transações.",
      );
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setIsLoading(false);
      }
    }
  }, [repository, user, buildRepositoryFilters]);

  const loadMore = useCallback(async () => {
    if (
      !user ||
      !nextCursor ||
      !hasMore ||
      listLimit === undefined ||
      isLoadingMoreRef.current
    ) {
      return;
    }

    const requestVersion = requestVersionRef.current;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await listTransactions(
        repository,
        user.uid,
        buildRepositoryFilters(nextCursor),
      );

      if (requestVersion !== requestVersionRef.current) return;

      setTransactions((current) => {
        const merged = new Map(
          [...current, ...result.data].map((transaction) => [
            transaction.uid,
            transaction,
          ]),
        );
        return [...merged.values()];
      });
      setNextCursor(result.nextCursor ?? null);
      setHasMore(result.nextCursor != null);
    } catch (err) {
      if (requestVersion === requestVersionRef.current) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar mais transações.",
        );
      }
    } finally {
      isLoadingMoreRef.current = false;
      if (requestVersion === requestVersionRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [
    repository,
    user,
    nextCursor,
    hasMore,
    listLimit,
    buildRepositoryFilters,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredTransactions = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const dateKey = filters.date
      ? new Date(filters.date).toDateString()
      : undefined;

    return transactions.filter((transaction) => {
      if (
        filters.transactionType &&
        transaction.transactionType !== filters.transactionType
      ) {
        return false;
      }

      if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
        return false;
      }

      if (
        dateKey &&
        new Date(transaction.createdAt).toDateString() !== dateKey
      ) {
        return false;
      }

      if (
        search &&
        !(transaction.description ?? "").toLowerCase().includes(search)
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);

  const addTransaction = useCallback(
    async (data: Omit<CreateTransactionDTO, "userId">) => {
      if (!user) return;
      const transaction = await createTransaction(repository, {
        ...data,
        userId: user.uid,
      });
      setTransactions((current) => [transaction, ...current]);
    },
    [repository, user],
  );

  const editTransaction = useCallback(
    async (transactionId: string, data: UpdateTransactionDTO) => {
      await updateTransaction(repository, transactionId, data);
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.uid === transactionId
            ? { ...transaction, ...data }
            : transaction,
        ),
      );
    },
    [repository],
  );

  const removeTransaction = useCallback(
    async (transactionId: string) => {
      await deleteTransaction(repository, transactionId);
      setTransactions((current) =>
        current.filter((transaction) => transaction.uid !== transactionId),
      );
    },
    [repository],
  );

  return {
    transactions: filteredTransactions,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
    refresh,
    loadMore,
  };
}
