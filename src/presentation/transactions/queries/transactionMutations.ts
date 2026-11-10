import type { MutationOptions, QueryClient } from "@tanstack/react-query";
import type {
  CreateTransactionDTO,
  Transaction,
  UpdateTransactionDTO,
} from "@domain/transactions/entities/Transaction";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  type TransactionUseCaseDeps,
} from "@application/transactions/transactionUseCases";
import {
  createOptimisticId,
  prepareOptimisticUpdate,
  restoreSnapshot,
  type QuerySnapshot,
} from "@presentation/query/listCache";
import { queryKeys } from "@presentation/query/queryKeys";
import { applyTransactionChangeToCache } from "./transactionCache";

export type NewTransaction = Omit<CreateTransactionDTO, "userId">;

export type EditTransactionVariables = {
  transactionId: string;
  data: UpdateTransactionDTO;
};

type OptimisticContext = {
  snapshot: QuerySnapshot;
  optimisticId?: string;
};

type Clock = () => Date;

// As opções ficam fora dos hooks para serem testadas com um QueryClient real,
// sem renderizar componentes. O fluxo é o mesmo nas três operações:
// onMutate aplica a mudança no cache na hora, onError desfaz, onSuccess troca
// o palpite pelo que o servidor confirmou e onSettled revalida em segundo plano.

export function createTransactionMutationOptions(
  queryClient: QueryClient,
  deps: TransactionUseCaseDeps,
  userId: string,
  now: Clock = () => new Date(),
): MutationOptions<Transaction, Error, NewTransaction, OptimisticContext> {
  const scope = queryKeys.transactions.all(userId);

  return {
    mutationFn: (data) => createTransaction(deps, { ...data, userId }),
    onMutate: async (data) => {
      const snapshot = await prepareOptimisticUpdate(queryClient, scope);
      const optimistic: Transaction = {
        ...data,
        userId,
        uid: createOptimisticId("transaction"),
        createdAt: now().toISOString(),
      };
      applyTransactionChangeToCache(queryClient, userId, {
        type: "created",
        transaction: optimistic,
      });
      return { snapshot, optimisticId: optimistic.uid };
    },
    onError: (_error, _data, context) =>
      restoreSnapshot(queryClient, context?.snapshot),
    onSuccess: (created, _data, context) => {
      if (context?.optimisticId) {
        applyTransactionChangeToCache(queryClient, userId, {
          type: "deleted",
          transactionId: context.optimisticId,
        });
      }
      applyTransactionChangeToCache(queryClient, userId, {
        type: "created",
        transaction: created,
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: scope });
    },
  };
}

export function updateTransactionMutationOptions(
  queryClient: QueryClient,
  deps: TransactionUseCaseDeps,
  userId: string,
): MutationOptions<
  UpdateTransactionDTO,
  Error,
  EditTransactionVariables,
  OptimisticContext
> {
  const scope = queryKeys.transactions.all(userId);

  return {
    mutationFn: ({ transactionId, data }) =>
      updateTransaction(deps, userId, transactionId, data),
    onMutate: async ({ transactionId, data }) => {
      const snapshot = await prepareOptimisticUpdate(queryClient, scope);
      applyTransactionChangeToCache(queryClient, userId, {
        type: "updated",
        transactionId,
        data,
      });
      return { snapshot };
    },
    onError: (_error, _variables, context) =>
      restoreSnapshot(queryClient, context?.snapshot),
    onSuccess: (normalized, { transactionId }) =>
      applyTransactionChangeToCache(queryClient, userId, {
        type: "updated",
        transactionId,
        data: normalized,
      }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: scope });
    },
  };
}

export function deleteTransactionMutationOptions(
  queryClient: QueryClient,
  deps: Pick<TransactionUseCaseDeps, "transactions">,
  userId: string,
): MutationOptions<void, Error, string, OptimisticContext> {
  const scope = queryKeys.transactions.all(userId);

  return {
    mutationFn: (transactionId) =>
      deleteTransaction(deps, userId, transactionId),
    onMutate: async (transactionId) => {
      const snapshot = await prepareOptimisticUpdate(queryClient, scope);
      applyTransactionChangeToCache(queryClient, userId, {
        type: "deleted",
        transactionId,
      });
      return { snapshot };
    },
    onError: (_error, _transactionId, context) =>
      restoreSnapshot(queryClient, context?.snapshot),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: scope });
    },
  };
}
