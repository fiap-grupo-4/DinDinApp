import { fromCents } from "@/src/lib/currency";
import { Category } from "@domain/categories/entities/Category";
import { Transaction } from "@domain/transactions/entities/Transaction";
import { useMemo } from "react";
import type {
  BalancePoint,
  ExpenseCategory,
  FinancialSummary,
  RecentTransaction,
} from "../models/dashboard-metrics";

const EXPENSE_COLORS = [
  "#F45B8D",
  "#F5A445",
  "#8B7CF6",
  "#B7BDC6",
  "#4ECDC4",
  "#F6C744",
];

const RECENT_TRANSACTIONS_LIMIT = 5;
const BALANCE_MONTHS = 8;

function toValidDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function signedValueInCents(transaction: Transaction): number {
  return transaction.transactionType === "income"
    ? transaction.valueInCents
    : -transaction.valueInCents;
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isSameMonth(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  );
}

function summarize(
  transactions: Transaction[],
  predicate: (date: Date) => boolean,
): FinancialSummary {
  const totals = transactions.reduce(
    (summary, transaction) => {
      const date = toValidDate(transaction.createdAt);
      if (!date || !predicate(date)) return summary;

      if (transaction.transactionType === "income") {
        summary.income += transaction.valueInCents;
      } else {
        summary.expense += transaction.valueInCents;
      }

      return summary;
    },
    { income: 0, expense: 0 },
  );

  return {
    income: fromCents(totals.income),
    expense: fromCents(totals.expense),
  };
}

function buildExpensesByCategory(
  transactions: Transaction[],
  categories: Category[],
  now: Date,
): ExpenseCategory[] {
  const categoryNames = new Map(
    categories.map((category) => [category.uid, category.name]),
  );
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    const date = toValidDate(transaction.createdAt);
    if (
      transaction.transactionType !== "outcome" ||
      !date ||
      !isSameMonth(date, now)
    ) {
      continue;
    }

    const categoryId = transaction.categoryId || "other";
    totals.set(
      categoryId,
      (totals.get(categoryId) ?? 0) + transaction.valueInCents,
    );
  }

  return [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([categoryId, totalInCents], index) => ({
      id: categoryId,
      label: categoryNames.get(categoryId) ?? "Outros",
      total: fromCents(totalInCents),
      color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
    }));
}

function buildBalanceTrend(
  transactions: Transaction[],
  now: Date,
): BalancePoint[] {
  const datedTransactions = transactions.flatMap((transaction) => {
    const date = toValidDate(transaction.createdAt);
    return date ? [{ transaction, date }] : [];
  });

  if (datedTransactions.length === 0) return [];

  const months = Array.from({ length: BALANCE_MONTHS }, (_, index) => {
    const offset = index - (BALANCE_MONTHS - 1);
    return new Date(now.getFullYear(), now.getMonth() + offset, 1);
  });

  let balanceInCents = datedTransactions.reduce((total, item) => {
    if (item.date >= months[0]) return total;
    return total + signedValueInCents(item.transaction);
  }, 0);

  return months.map((month) => {
    balanceInCents += datedTransactions.reduce((total, item) => {
      if (!isSameMonth(item.date, month)) return total;
      return total + signedValueInCents(item.transaction);
    }, 0);

    const label = month
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "");

    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value: fromCents(balanceInCents),
    };
  });
}

export function useDashboardMetrics(
  transactions: Transaction[],
  categories: Category[],
) {
  return useMemo(() => {
    const now = new Date();
    const currentBalance = fromCents(
      transactions.reduce(
        (total, transaction) => total + signedValueInCents(transaction),
        0,
      ),
    );

    const recentTransactions: RecentTransaction[] = [...transactions]
      .sort((left, right) => {
        const leftTime = toValidDate(left.createdAt)?.getTime() ?? 0;
        const rightTime = toValidDate(right.createdAt)?.getTime() ?? 0;
        return rightTime - leftTime;
      })
      .slice(0, RECENT_TRANSACTIONS_LIMIT)
      .map((transaction) => ({
        id: transaction.uid,
        title: transaction.description || "Transação",
        amount: fromCents(transaction.valueInCents),
        transactionType: transaction.transactionType,
        date:
          toValidDate(transaction.createdAt)?.toLocaleDateString("pt-BR") ??
          "",
      }));

    return {
      currentBalance,
      dailySummary: summarize(transactions, (date) => isSameDay(date, now)),
      monthlySummary: summarize(transactions, (date) =>
        isSameMonth(date, now),
      ),
      expensesByCategory: buildExpensesByCategory(
        transactions,
        categories,
        now,
      ),
      balanceTrend: buildBalanceTrend(transactions, now),
      recentTransactions,
    };
  }, [transactions, categories]);
}
