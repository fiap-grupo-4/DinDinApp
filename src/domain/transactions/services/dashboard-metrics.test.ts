import { Transaction } from "../entities/Transaction";
import {
  buildMonthlyBalanceTrend,
  calculateBalanceInCents,
  getRecentTransactions,
  groupMonthlyExpensesByCategory,
  summarizeDay,
  summarizeMonth,
} from "./dashboard-metrics";
import { describe, expect, it } from "vitest";

const now = new Date(2026, 5, 15, 12);

function tx(
  uid: string,
  type: "income" | "outcome",
  value: number,
  date: Date | string,
  categoryId?: string,
): Transaction {
  return {
    uid,
    userId: "u1",
    valueInCents: value,
    transactionType: type,
    createdAt: typeof date === "string" ? date : date.toISOString(),
    categoryId,
  };
}

describe("calculateBalanceInCents", () => {
  it("soma receitas e subtrai despesas", () => {
    expect(
      calculateBalanceInCents([
        tx("1", "income", 1000, now),
        tx("2", "outcome", 300, now),
      ]),
    ).toBe(700);
  });

  it("lista vazia é zero", () => {
    expect(calculateBalanceInCents([])).toBe(0);
  });
});

describe("summarizeDay / summarizeMonth", () => {
  const items = [
    tx("1", "income", 1000, new Date(2026, 5, 15, 8)),
    tx("2", "outcome", 200, new Date(2026, 5, 15, 20)),
    tx("3", "outcome", 50, new Date(2026, 5, 3, 10)),
    tx("4", "income", 999, new Date(2026, 4, 15, 10)),
    tx("5", "income", 999, "data-invalida"),
  ];

  it("resume o dia", () => {
    expect(summarizeDay(items, now)).toEqual({
      incomeInCents: 1000,
      expenseInCents: 200,
    });
  });

  it("resume o mês ignorando outro mês e data inválida", () => {
    expect(summarizeMonth(items, now)).toEqual({
      incomeInCents: 1000,
      expenseInCents: 250,
    });
  });
});

describe("groupMonthlyExpensesByCategory", () => {
  it("agrupa só despesas do mês, 'other' sem categoria, ordenado desc", () => {
    const result = groupMonthlyExpensesByCategory(
      [
        tx("1", "outcome", 100, new Date(2026, 5, 1), "a"),
        tx("2", "outcome", 500, new Date(2026, 5, 2), "b"),
        tx("3", "outcome", 50, new Date(2026, 5, 3), "a"),
        tx("4", "outcome", 300, new Date(2026, 5, 4)),
        tx("5", "income", 9999, new Date(2026, 5, 5), "a"),
        tx("6", "outcome", 9999, new Date(2026, 4, 5), "a"),
        tx("7", "outcome", 9999, "invalida", "a"),
      ],
      now,
    );
    expect(result).toEqual([
      { categoryId: "b", totalInCents: 500 },
      { categoryId: "other", totalInCents: 300 },
      { categoryId: "a", totalInCents: 150 },
    ]);
  });
});

describe("buildMonthlyBalanceTrend", () => {
  it("lista vazia retorna []", () => {
    expect(buildMonthlyBalanceTrend([], now, 8)).toEqual([]);
  });

  it("monthCount <= 0 retorna []", () => {
    expect(
      buildMonthlyBalanceTrend([tx("1", "income", 1, now)], now, 0),
    ).toEqual([]);
  });

  it("gera 8 meses em ordem com saldo acumulado", () => {
    const result = buildMonthlyBalanceTrend(
      [
        tx("old", "income", 1000, new Date(2025, 0, 10)),
        tx("m1", "outcome", 200, new Date(2025, 11, 10)),
        tx("m2", "income", 500, new Date(2026, 5, 1)),
      ],
      now,
      8,
    );
    expect(result).toHaveLength(8);
    expect(result.map((r) => r.month.getMonth())).toEqual([
      10, 11, 0, 1, 2, 3, 4, 5,
    ]);
    expect(result[0].month.getFullYear()).toBe(2025);
    expect(result.map((r) => r.balanceInCents)).toEqual([
      1000, 800, 800, 800, 800, 800, 800, 1300,
    ]);
  });
});

describe("buildMonthlyBalanceTrend (bordas)", () => {
  it("vira o ano quando now é fevereiro: de jul do ano anterior a fev", () => {
    const february = new Date(2026, 1, 10, 12);
    const result = buildMonthlyBalanceTrend(
      [tx("1", "income", 100, new Date(2025, 6, 5))],
      february,
      8,
    );
    expect(result.map((r) => [r.month.getFullYear(), r.month.getMonth()])).toEqual([
      [2025, 6],
      [2025, 7],
      [2025, 8],
      [2025, 9],
      [2025, 10],
      [2025, 11],
      [2026, 0],
      [2026, 1],
    ]);
    expect(result.every((r) => r.balanceInCents === 100)).toBe(true);
  });

  it("monthCount negativo retorna []", () => {
    expect(
      buildMonthlyBalanceTrend([tx("1", "income", 1, now)], now, -3),
    ).toEqual([]);
  });

  it("monthCount 1 devolve só o mês atual com o saldo anterior acumulado", () => {
    const result = buildMonthlyBalanceTrend(
      [
        tx("old", "income", 1000, new Date(2026, 0, 1)),
        tx("cur", "outcome", 300, new Date(2026, 5, 2)),
      ],
      now,
      1,
    );
    expect(result).toHaveLength(1);
    expect(result[0].balanceInCents).toBe(700);
  });

  it("só datas inválidas retorna []", () => {
    expect(
      buildMonthlyBalanceTrend([tx("1", "income", 1, "lixo")], now, 3),
    ).toEqual([]);
  });

  it("ignora transação inválida e transação posterior ao mês atual", () => {
    const result = buildMonthlyBalanceTrend(
      [
        tx("ok", "income", 500, new Date(2026, 5, 1)),
        tx("invalida", "income", 999, "lixo"),
        tx("futura", "income", 999, new Date(2026, 6, 1)),
      ],
      now,
      2,
    );
    expect(result.map((r) => r.balanceInCents)).toEqual([0, 500]);
  });
});

describe("getRecentTransactions (bordas)", () => {
  it("createdAt inválido vai para o fim, mesmo vindo primeiro", () => {
    const bad = tx("bad", "income", 1, "lixo");
    const old = tx("old", "income", 1, new Date(2026, 0, 1));
    const recent = tx("recent", "income", 1, new Date(2026, 5, 1));
    expect(
      getRecentTransactions([bad, old, recent], 3).map((t) => t.uid),
    ).toEqual(["recent", "old", "bad"]);
  });

  it("limit 0 retorna vazio", () => {
    expect(
      getRecentTransactions([tx("a", "income", 1, now)], 0),
    ).toEqual([]);
  });

  it("limit maior que o total devolve todas", () => {
    expect(
      getRecentTransactions([tx("a", "income", 1, now)], 10),
    ).toHaveLength(1);
  });
});

describe("getRecentTransactions", () => {
  const a = tx("a", "income", 1, new Date(2026, 5, 1));
  const b = tx("b", "income", 1, new Date(2026, 5, 3));
  const c = tx("c", "income", 1, new Date(2026, 5, 2));

  it("ordena por data desc e respeita limit", () => {
    expect(getRecentTransactions([a, b, c], 2).map((t) => t.uid)).toEqual([
      "b",
      "c",
    ]);
  });

  it("não muta o array de entrada", () => {
    const input = [a, b, c];
    getRecentTransactions(input, 3);
    expect(input.map((t) => t.uid)).toEqual(["a", "b", "c"]);
  });

  it("limit negativo retorna vazio", () => {
    expect(getRecentTransactions([a], -1)).toEqual([]);
  });
});
