import { Transaction } from "../entities/Transaction";
import {
  buildMonthlyBalanceTrend,
  calculateBalanceInCents,
  computeDashboardMetrics,
  getRecentTransactions,
  groupMonthlyExpensesByCategory,
  summarizeDay,
  summarizeMonth,
} from "./dashboard-metrics";
import { describe, expect, it } from "vitest";

const now = new Date(2026, 5, 15, 12);
const DAY = 86_400_000;

function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    return state / 2_147_483_648;
  };
}

function randomTransactions(seed: number, count: number): Transaction[] {
  const random = createRandom(seed);
  return Array.from({ length: count }, (_, index) => ({
    uid: `t${index}`,
    userId: "u1",
    valueInCents: Math.floor(random() * 100_000) + 1,
    transactionType: random() < 0.5 ? "income" : "outcome",
    createdAt:
      random() < 0.05
        ? "data-invalida"
        : new Date(now.getTime() - Math.floor(random() * 400) * DAY * (random() < 0.3 ? 0.01 : 1)).toISOString(),
    categoryId: ["c1", "c2", "c-excluida", undefined][Math.floor(random() * 4)],
  }));
}

describe("computeDashboardMetrics", () => {
  it.each([0, 1, 7, 42, 250])(
    "dá o mesmo resultado das funções separadas (%i transações)",
    (count) => {
      for (let seed = 1; seed <= 20; seed++) {
        const transactions = randomTransactions(seed * 31 + count, count);
        const knownCategoryIds = new Set(["c1", "c2"]);

        expect(
          computeDashboardMetrics(transactions, now, {
            balanceMonths: 8,
            recentLimit: 5,
            knownCategoryIds,
          }),
        ).toEqual({
          balanceInCents: calculateBalanceInCents(transactions),
          daily: summarizeDay(transactions, now),
          monthly: summarizeMonth(transactions, now),
          monthlyExpensesByCategory: groupMonthlyExpensesByCategory(
            transactions,
            now,
            knownCategoryIds,
          ),
          balanceTrend: buildMonthlyBalanceTrend(transactions, now, 8),
          recentTransactions: getRecentTransactions(transactions, 5),
        });
      }
    },
  );

  it("sem meses no gráfico, devolve a tendência vazia", () => {
    const transactions = randomTransactions(3, 10);
    expect(
      computeDashboardMetrics(transactions, now, {
        balanceMonths: 0,
        recentLimit: 0,
      }).balanceTrend,
    ).toEqual([]);
  });
});
