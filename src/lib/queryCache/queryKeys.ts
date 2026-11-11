import type { TransactionFiltersValue } from "@domain/transactions/entities/TransactionFilters";

// Filtros aplicados no servidor. A busca por texto é feita em memória e fica de
// fora da chave, para digitar não disparar novas requisições.
export type TransactionServerFilters = Pick<
  TransactionFiltersValue,
  "transactionType" | "categoryId" | "date"
>;

export function toTransactionServerFilters(
  filters: TransactionServerFilters,
): TransactionServerFilters {
  return {
    transactionType: filters.transactionType,
    categoryId: filters.categoryId,
    date: filters.date,
  };
}

// Todas as chaves começam pelo recurso e pelo usuário, para que a invalidação
// e as atualizações otimistas atinjam só os dados de quem está logado.
export const queryKeys = {
  transactions: {
    root: ["transactions"] as const,
    all: (userId: string) => ["transactions", userId] as const,
    lists: (userId: string) => ["transactions", userId, "list"] as const,
    list: (userId: string, filters: TransactionServerFilters) =>
      [
        "transactions",
        userId,
        "list",
        toTransactionServerFilters(filters),
      ] as const,
    history: (userId: string) => ["transactions", userId, "history"] as const,
  },
  categories: {
    root: ["categories"] as const,
    all: (userId: string) => ["categories", userId] as const,
  },
  savingsGoals: {
    root: ["savingsGoals"] as const,
    all: (userId: string) => ["savingsGoals", userId] as const,
  },
};
