import { Transaction } from "../entities/Transaction";
import { TransactionFiltersValue } from "../entities/TransactionFilters";
import {
  countActiveFilters,
  filterTransactions,
  getDayRange,
} from "./transaction-filters";
import { describe, expect, it } from "vitest";

function tx(partial: Partial<Transaction> & { uid: string }): Transaction {
  return {
    userId: "u1",
    valueInCents: 100,
    transactionType: "outcome",
    createdAt: new Date(2026, 5, 15, 10).toISOString(),
    ...partial,
  };
}

const items = [
  tx({ uid: "1", description: "Mercado Central", categoryId: "food" }),
  tx({
    uid: "2",
    transactionType: "income",
    description: "Salário",
    createdAt: new Date(2026, 5, 16, 10).toISOString(),
  }),
  tx({ uid: "3", createdAt: "invalida" }),
];

const empty: TransactionFiltersValue = { search: "" };
const ids = (list: Transaction[]) => list.map((t) => t.uid);

describe("filterTransactions", () => {
  it("sem filtros retorna tudo", () => {
    expect(ids(filterTransactions(items, empty))).toEqual(["1", "2", "3"]);
  });

  it("filtra por tipo", () => {
    expect(
      ids(filterTransactions(items, { ...empty, transactionType: "income" })),
    ).toEqual(["2"]);
  });

  it("filtra por categoria", () => {
    expect(
      ids(filterTransactions(items, { ...empty, categoryId: "food" })),
    ).toEqual(["1"]);
  });

  it("filtra por dia, excluindo data inválida", () => {
    const date = new Date(2026, 5, 15, 23).toISOString();
    expect(ids(filterTransactions(items, { ...empty, date }))).toEqual(["1"]);
  });

  it("busca case-insensitive com trim", () => {
    expect(
      ids(filterTransactions(items, { ...empty, search: "  MERCADO " })),
    ).toEqual(["1"]);
  });

  it("busca não casa transação sem descrição", () => {
    expect(
      ids(filterTransactions(items, { ...empty, search: "x" })),
    ).toEqual([]);
  });
});

describe("filterTransactions (bordas)", () => {
  it("filters.date inválido é ignorado em vez de excluir tudo", () => {
    expect(ids(filterTransactions(items, { ...empty, date: "lixo" }))).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("combina filtros com E lógico", () => {
    expect(
      ids(
        filterTransactions(items, {
          search: "mercado",
          transactionType: "outcome",
          categoryId: "food",
          date: new Date(2026, 5, 15, 23).toISOString(),
        }),
      ),
    ).toEqual(["1"]);
    expect(
      ids(
        filterTransactions(items, {
          search: "mercado",
          transactionType: "income",
        }),
      ),
    ).toEqual([]);
  });

  it("busca só com espaços não filtra", () => {
    expect(ids(filterTransactions(items, { ...empty, search: "   " }))).toEqual([
      "1",
      "2",
      "3",
    ]);
  });
});

describe("getDayRange", () => {
  it("vazio ou inválido retorna {}", () => {
    expect(getDayRange()).toEqual({});
    expect(getDayRange("")).toEqual({});
    expect(getDayRange("nao-e-data")).toEqual({});
  });

  it("retorna [início do dia, início do dia seguinte)", () => {
    const range = getDayRange(new Date(2026, 5, 15, 17, 30).toISOString());
    expect(range.fromDate).toBe(new Date(2026, 5, 15).toISOString());
    expect(range.toDate).toBe(new Date(2026, 5, 16).toISOString());
  });
});

describe("countActiveFilters", () => {
  it("zero sem filtros ou só com espaços na busca", () => {
    expect(countActiveFilters(empty)).toBe(0);
    expect(countActiveFilters({ search: "   " })).toBe(0);
  });

  it("conta cada filtro ativo", () => {
    expect(
      countActiveFilters({
        search: "a",
        transactionType: "income",
        categoryId: "c",
        date: "2026-06-15",
      }),
    ).toBe(4);
    expect(countActiveFilters({ search: "", categoryId: "c" })).toBe(1);
  });
});
