import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthState } from "@features/auth/providers/AuthProvider";
import { useTransactionRepository } from "@features/transactions/providers/TransactionRepositoryProvider";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "@domain/transactions/use-cases/transactionUseCases";
import {
  CreateTransactionDTO,
  Transaction,
  UpdateTransactionDTO,
} from "@domain/transactions/entities/Transaction";
import { TransactionFiltersValue } from "@features/transactions/ui/transaction-filters-drawer";

const LIST_LIMIT = 100;

export function useTransactions(filters: TransactionFiltersValue) {
  const repository = useTransactionRepository();
  const { user } = useAuthState();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    listTransactions(repository, user.uid, { limit: LIST_LIMIT })
      .then((result) => setTransactions(result.data))
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar transações.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [repository, user]);

  useEffect(() => {
    refresh();
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

      if (dateKey && new Date(transaction.createdAt).toDateString() !== dateKey) {
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
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
    refresh,
  };
}
