import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { Transaction } from "@domain/transactions/entities/Transaction";
import {
  applyTransactionChange,
  type TransactionChange,
} from "@domain/transactions/events/TransactionChange";
import type {
  PaginatedResult,
  TransactionCursor,
} from "@domain/transactions/repositories/ITransactionRepository";
import { queryKeys } from "@/src/infrastructure/tanstack/queryKeys";

export type TransactionPage = PaginatedResult<Transaction>;
export type TransactionPageParam = TransactionCursor | null;
export type TransactionPages = InfiniteData<
  TransactionPage,
  TransactionPageParam
>;

// Junta as páginas numa lista só, sem repetir transações que mudaram de página
// entre uma busca e outra.
export function flattenTransactionPages(
  data: InfiniteData<TransactionPage, unknown> | undefined,
): Transaction[] {
  if (!data) return [];
  const byId = new Map<string, Transaction>();
  for (const page of data.pages) {
    for (const transaction of page.data) {
      if (!byId.has(transaction.uid)) byId.set(transaction.uid, transaction);
    }
  }
  return [...byId.values()];
}

export function applyChangeToPages(
  data: TransactionPages | undefined,
  change: TransactionChange,
): TransactionPages | undefined {
  if (!data || data.pages.length === 0) return data;

  if (change.type === "created") {
    // Transações novas são as mais recentes: entram no topo da primeira página.
    return {
      ...data,
      pages: data.pages.map((page, index) => ({
        ...page,
        data:
          index === 0
            ? applyTransactionChange(page.data, change)
            : page.data.filter(
                (transaction) => transaction.uid !== change.transaction.uid,
              ),
      })),
    };
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: applyTransactionChange(page.data, change),
    })),
  };
}

// Aplica a mudança em todas as telas que usam transações do usuário: as listas
// paginadas (uma por combinação de filtros) e o histórico completo do dashboard.
export function applyTransactionChangeToCache(
  queryClient: QueryClient,
  userId: string,
  change: TransactionChange,
): void {
  queryClient.setQueriesData<TransactionPages>(
    { queryKey: queryKeys.transactions.lists(userId) },
    (data) => applyChangeToPages(data, change),
  );
  queryClient.setQueryData<Transaction[]>(
    queryKeys.transactions.history(userId),
    (data) => (data ? applyTransactionChange(data, change) : data),
  );
}
