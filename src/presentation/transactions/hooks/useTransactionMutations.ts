import { useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTransactionDTO } from "@domain/transactions/entities/Transaction";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import { useRepositories } from "@presentation/providers/RepositoriesContext";
import {
  createTransactionMutationOptions,
  deleteTransactionMutationOptions,
  type NewTransaction,
  updateTransactionMutationOptions,
} from "@presentation/transactions/queries/transactionMutations";

// Criar, editar e excluir com atualização otimista. Como o cache é único, a
// mudança aparece ao mesmo tempo na lista de transações e no dashboard.
export function useTransactionMutations() {
  const queryClient = useQueryClient();
  const { transactions, categories } = useRepositories();
  const deps = useMemo(
    () => ({ transactions, categories }),
    [transactions, categories],
  );
  const { user } = useAuthState();
  const userId = user?.uid ?? "";

  const { mutateAsync: create } = useMutation(
    createTransactionMutationOptions(queryClient, deps, userId),
  );
  const { mutateAsync: update } = useMutation(
    updateTransactionMutationOptions(queryClient, deps, userId),
  );
  const { mutateAsync: remove } = useMutation(
    deleteTransactionMutationOptions(queryClient, deps, userId),
  );

  const addTransaction = useCallback(
    async (data: NewTransaction) => {
      if (!userId) return;
      await create(data);
    },
    [create, userId],
  );

  const editTransaction = useCallback(
    async (transactionId: string, data: UpdateTransactionDTO) => {
      if (!userId) return;
      await update({ transactionId, data });
    },
    [update, userId],
  );

  const removeTransaction = useCallback(
    async (transactionId: string) => {
      if (!userId) return;
      await remove(transactionId);
    },
    [remove, userId],
  );

  return { addTransaction, editTransaction, removeTransaction };
}
