import {
  CreateTransactionDTO,
  Transaction,
  UpdateTransactionDTO,
} from "@domain/transactions/entities/Transaction";
import type { TransactionFiltersValue } from "@domain/transactions/entities/TransactionFilters";
import {
  applyTransactionChange,
  type TransactionChange,
} from "@domain/transactions/events/TransactionChange";
import type {
  TransactionCursor,
  TransactionFilters,
} from "@domain/transactions/repositories/ITransactionRepository";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "@application/transactions/transactionUseCases";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import {
  filterTransactions,
  getDayRange,
} from "@domain/transactions/services/transaction-filters";
import { useRepositories } from "@presentation/providers/RepositoriesContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EMPTY,
  Subject,
  catchError,
  concat,
  exhaustMap,
  from,
  map,
  merge,
  of,
  scan,
  startWith,
  switchMap,
  tap,
} from "rxjs";

const LIST_LIMIT = 25;

type UseTransactionsOptions = {
  limit?: number | null;
};

type TransactionListState = {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
};

type TransactionListEvent =
  | { type: "refreshStarted" }
  | { type: "firstPageLoaded"; data: Transaction[]; hasMore: boolean }
  | { type: "firstPageFailed"; error: string }
  | { type: "loadMoreStarted" }
  | { type: "nextPageLoaded"; data: Transaction[]; hasMore: boolean }
  | { type: "nextPageFailed"; error: string }
  | { type: "changed"; change: TransactionChange };

const INITIAL_STATE: TransactionListState = {
  transactions: [],
  isLoading: true,
  isLoadingMore: false,
  hasMore: false,
  error: null,
};

const SIGNED_OUT_STATE: TransactionListState = {
  ...INITIAL_STATE,
  isLoading: false,
};

function reduceTransactionList(
  state: TransactionListState,
  event: TransactionListEvent,
): TransactionListState {
  switch (event.type) {
    case "refreshStarted":
      return { ...state, isLoading: true, isLoadingMore: false, error: null };
    case "firstPageLoaded":
      return {
        ...state,
        transactions: event.data,
        hasMore: event.hasMore,
        isLoading: false,
      };
    case "firstPageFailed":
      return { ...state, hasMore: false, isLoading: false, error: event.error };
    case "loadMoreStarted":
      return { ...state, isLoadingMore: true, error: null };
    case "nextPageLoaded": {
      const merged = new Map(
        [...state.transactions, ...event.data].map((transaction) => [
          transaction.uid,
          transaction,
        ]),
      );
      return {
        ...state,
        transactions: [...merged.values()],
        hasMore: event.hasMore,
        isLoadingMore: false,
      };
    }
    case "nextPageFailed":
      return { ...state, isLoadingMore: false, error: event.error };
    case "changed":
      return {
        ...state,
        transactions: applyTransactionChange(state.transactions, event.change),
      };
  }
}

function toErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useTransactions(
  filters: TransactionFiltersValue,
  options?: UseTransactionsOptions,
) {
  const {
    transactions: transactionRepository,
    categories: categoryRepository,
    transactionChanges: changes$,
  } = useRepositories();
  const repository = useMemo(
    () => ({
      transactions: transactionRepository,
      categories: categoryRepository,
    }),
    [transactionRepository, categoryRepository],
  );
  const { user } = useAuthState();
  const userId = user?.uid;
  const listLimit =
    options?.limit === null ? undefined : (options?.limit ?? LIST_LIMIT);

  const [state, setState] = useState<TransactionListState>(INITIAL_STATE);
  const stateRef = useRef(state);
  const [refresh$] = useState(() => new Subject<void>());
  const [loadMore$] = useState(() => new Subject<void>());

  useEffect(() => {
    if (!userId) {
      stateRef.current = SIGNED_OUT_STATE;
      setState(SIGNED_OUT_STATE);
      return;
    }

    const buildRepositoryFilters = (
      startAfter?: TransactionCursor,
    ): TransactionFilters | undefined => {
      if (listLimit === undefined) return undefined;

      return {
        limit: listLimit,
        startAfter,
        transactionType: filters.transactionType,
        categoryId: filters.categoryId,
        ...getDayRange(filters.date),
      };
    };

    const fetchPage = (startAfter?: TransactionCursor) =>
      from(
        listTransactions(repository, userId, buildRepositoryFilters(startAfter)),
      );

    const pages$ = refresh$.pipe(
      startWith(undefined),
      switchMap(() => {
        let cursor: TransactionCursor | null = null;

        const firstPage$ = concat(
          of<TransactionListEvent>({ type: "refreshStarted" }),
          fetchPage().pipe(
            tap((result) => {
              cursor = result.nextCursor ?? null;
            }),
            map(
              (result): TransactionListEvent => ({
                type: "firstPageLoaded",
                data: result.data,
                hasMore: result.nextCursor != null,
              }),
            ),
            catchError((err) =>
              of<TransactionListEvent>({
                type: "firstPageFailed",
                error: toErrorMessage(
                  err,
                  "Não foi possível carregar transações.",
                ),
              }),
            ),
          ),
        );

        const nextPages$ = loadMore$.pipe(
          exhaustMap(() => {
            if (!cursor) return EMPTY;

            return concat(
              of<TransactionListEvent>({ type: "loadMoreStarted" }),
              fetchPage(cursor).pipe(
                tap((result) => {
                  cursor = result.nextCursor ?? null;
                }),
                map(
                  (result): TransactionListEvent => ({
                    type: "nextPageLoaded",
                    data: result.data,
                    hasMore: result.nextCursor != null,
                  }),
                ),
                catchError((err) =>
                  of<TransactionListEvent>({
                    type: "nextPageFailed",
                    error: toErrorMessage(
                      err,
                      "Não foi possível carregar mais transações.",
                    ),
                  }),
                ),
              ),
            );
          }),
        );

        return concat(firstPage$, nextPages$);
      }),
    );

    const localChanges$ = changes$.pipe(
      map((change): TransactionListEvent => ({ type: "changed", change })),
    );

    const subscription = merge(pages$, localChanges$)
      .pipe(scan(reduceTransactionList, stateRef.current))
      .subscribe((nextState) => {
        stateRef.current = nextState;
        setState(nextState);
      });

    return () => subscription.unsubscribe();
  }, [
    repository,
    changes$,
    refresh$,
    loadMore$,
    userId,
    listLimit,
    filters.transactionType,
    filters.categoryId,
    filters.date,
  ]);

  const refresh = useCallback(() => refresh$.next(), [refresh$]);
  const loadMore = useCallback(() => loadMore$.next(), [loadMore$]);

  const filteredTransactions = useMemo(
    () => filterTransactions(state.transactions, filters),
    [state.transactions, filters],
  );

  const addTransaction = useCallback(
    async (data: Omit<CreateTransactionDTO, "userId">) => {
      if (!userId) return;
      await createTransaction(repository, { ...data, userId });
    },
    [repository, userId],
  );

  const editTransaction = useCallback(
    async (transactionId: string, data: UpdateTransactionDTO) => {
      if (!userId) return;
      await updateTransaction(repository, userId, transactionId, data);
    },
    [repository, userId],
  );

  const removeTransaction = useCallback(
    async (transactionId: string) => {
      if (!userId) return;
      await deleteTransaction(repository, userId, transactionId);
    },
    [repository, userId],
  );

  return {
    transactions: filteredTransactions,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    hasMore: state.hasMore,
    error: state.error,
    addTransaction,
    editTransaction,
    removeTransaction,
    refresh,
    loadMore,
  };
}
