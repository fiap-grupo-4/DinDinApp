import { EMPTY_TRANSACTION_FILTERS } from "@domain/transactions/entities/TransactionFilters";
import { beforeEach, describe, expect, it } from "vitest";
import {
  selectActiveFilterCount,
  selectSearch,
  selectTransactionFilters,
  useTransactionFiltersStore,
} from "./transactionFiltersStore";

describe("useTransactionFiltersStore", () => {
  beforeEach(() => {
    useTransactionFiltersStore.getState().reset();
  });

  it("inicia com filtros vazios", () => {
    const state = useTransactionFiltersStore.getState();

    expect(selectTransactionFilters(state)).toEqual(EMPTY_TRANSACTION_FILTERS);
    expect(selectSearch(state)).toBe("");
    expect(selectActiveFilterCount(state)).toBe(0);
  });

  it("atualiza a busca sem perder os demais filtros e ignora valor igual", () => {
    const store = useTransactionFiltersStore.getState();
    store.applyFilters({ transactionType: "income", categoryId: "cat-1" });

    store.setSearch("aluguel");
    const afterFirstSearch = useTransactionFiltersStore.getState();
    expect(selectTransactionFilters(afterFirstSearch)).toEqual({
      search: "aluguel",
      transactionType: "income",
      categoryId: "cat-1",
      date: undefined,
    });

    // Chamar setSearch com o mesmo valor não deve criar nova referência
    store.setSearch("aluguel");
    expect(useTransactionFiltersStore.getState().filters).toBe(
      afterFirstSearch.filters,
    );
  });

  it("aplica filtros do drawer preservando o texto de busca e contabilizando apenas filtros do drawer", () => {
    const store = useTransactionFiltersStore.getState();
    store.setSearch("mercado");
    store.applyFilters({
      transactionType: "outcome",
      categoryId: "cat-2",
      date: "2026-06-15T00:00:00.000Z",
    });

    const state = useTransactionFiltersStore.getState();
    expect(selectTransactionFilters(state)).toEqual({
      search: "mercado",
      transactionType: "outcome",
      categoryId: "cat-2",
      date: "2026-06-15T00:00:00.000Z",
    });
    expect(selectActiveFilterCount(state)).toBe(3);
  });

  it("clearFilters limpa os filtros do drawer mas preserva a busca atual", () => {
    const store = useTransactionFiltersStore.getState();
    store.setSearch("padaria");
    store.applyFilters({ transactionType: "outcome", categoryId: "cat-1" });

    store.clearFilters();

    const state = useTransactionFiltersStore.getState();
    expect(selectTransactionFilters(state)).toEqual({
      search: "padaria",
    });
    expect(selectActiveFilterCount(state)).toBe(0);
  });

  it("reset restaura todos os filtros incluindo a busca", () => {
    const store = useTransactionFiltersStore.getState();
    store.setSearch("padaria");
    store.applyFilters({ transactionType: "outcome" });

    store.reset();

    expect(
      selectTransactionFilters(useTransactionFiltersStore.getState()),
    ).toEqual(EMPTY_TRANSACTION_FILTERS);
  });
});
