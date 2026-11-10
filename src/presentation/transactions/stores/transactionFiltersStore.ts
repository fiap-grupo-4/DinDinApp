import { create } from "zustand";
import {
  EMPTY_TRANSACTION_FILTERS,
  type TransactionFiltersValue,
} from "@domain/transactions/entities/TransactionFilters";
import { countActiveFilters } from "@domain/transactions/services/transaction-filters";
import {
  toTransactionServerFilters,
  type TransactionServerFilters,
} from "@presentation/query/queryKeys";

// Filtros editados no drawer (tudo menos a busca, que tem campo próprio).
export type TransactionFiltersDraft = TransactionServerFilters;

type TransactionFiltersState = {
  filters: TransactionFiltersValue;
  setSearch: (search: string) => void;
  applyFilters: (draft: TransactionFiltersDraft) => void;
  clearFilters: () => void;
  reset: () => void;
};

// Estado de interface: fica só em memória, sobrevive à troca de abas e é
// zerado ao sair da conta.
export const useTransactionFiltersStore = create<TransactionFiltersState>()(
  (set) => ({
    filters: EMPTY_TRANSACTION_FILTERS,
    setSearch: (search) =>
      set((state) =>
        state.filters.search === search
          ? state
          : { filters: { ...state.filters, search } },
      ),
    applyFilters: (draft) =>
      set((state) => ({
        filters: {
          ...toTransactionServerFilters(draft),
          search: state.filters.search,
        },
      })),
    clearFilters: () =>
      set((state) => ({
        filters: { ...EMPTY_TRANSACTION_FILTERS, search: state.filters.search },
      })),
    reset: () => set({ filters: EMPTY_TRANSACTION_FILTERS }),
  }),
);

export const selectTransactionFilters = (state: TransactionFiltersState) =>
  state.filters;

export const selectSearch = (state: TransactionFiltersState) =>
  state.filters.search;

// Quantos filtros do drawer estão ativos; a busca não entra na contagem.
export const selectActiveFilterCount = (state: TransactionFiltersState) =>
  countActiveFilters({ ...state.filters, search: "" });
