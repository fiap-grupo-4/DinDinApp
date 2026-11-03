import { Transaction } from "../entities/Transaction";
import { isSameDay, isSameMonth, toValidDate } from "./transaction-dates";

export const UNCATEGORIZED_ID = "other";

export type PeriodSummary = {
  incomeInCents: number;
  expenseInCents: number;
};

export type CategoryExpenseTotal = {
  categoryId: string;
  totalInCents: number;
};

export type MonthlyBalance = {
  month: Date;
  balanceInCents: number;
};

export function signedValueInCents(transaction: Transaction): number {
  return transaction.transactionType === "income"
    ? transaction.valueInCents
    : -transaction.valueInCents;
}

export function calculateBalanceInCents(transactions: Transaction[]): number {
  return transactions.reduce(
    (total, transaction) => total + signedValueInCents(transaction),
    0,
  );
}

function summarize(
  transactions: Transaction[],
  predicate: (date: Date) => boolean,
): PeriodSummary {
  return transactions.reduce<PeriodSummary>(
    (summary, transaction) => {
      const date = toValidDate(transaction.createdAt);
      if (!date || !predicate(date)) return summary;

      if (transaction.transactionType === "income") {
        summary.incomeInCents += transaction.valueInCents;
      } else {
        summary.expenseInCents += transaction.valueInCents;
      }

      return summary;
    },
    { incomeInCents: 0, expenseInCents: 0 },
  );
}

export function summarizeDay(
  transactions: Transaction[],
  now: Date,
): PeriodSummary {
  return summarize(transactions, (date) => isSameDay(date, now));
}

export function summarizeMonth(
  transactions: Transaction[],
  now: Date,
): PeriodSummary {
  return summarize(transactions, (date) => isSameMonth(date, now));
}

export function groupMonthlyExpensesByCategory(
  transactions: Transaction[],
  now: Date,
): CategoryExpenseTotal[] {
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

    const categoryId = transaction.categoryId || UNCATEGORIZED_ID;
    totals.set(
      categoryId,
      (totals.get(categoryId) ?? 0) + transaction.valueInCents,
    );
  }

  return [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([categoryId, totalInCents]) => ({ categoryId, totalInCents }));
}

export function buildMonthlyBalanceTrend(
  transactions: Transaction[],
  now: Date,
  monthCount: number,
): MonthlyBalance[] {
  const datedTransactions = transactions.flatMap((transaction) => {
    const date = toValidDate(transaction.createdAt);
    return date ? [{ transaction, date }] : [];
  });

  if (datedTransactions.length === 0 || monthCount <= 0) return [];

  const months = Array.from({ length: monthCount }, (_, index) => {
    const offset = index - (monthCount - 1);
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

    return { month, balanceInCents };
  });
}

export function getRecentTransactions(
  transactions: Transaction[],
  limit: number,
): Transaction[] {
  return [...transactions]
    .sort((left, right) => {
      const leftTime = toValidDate(left.createdAt)?.getTime() ?? 0;
      const rightTime = toValidDate(right.createdAt)?.getTime() ?? 0;
      return rightTime - leftTime;
    })
    .slice(0, Math.max(0, limit));
}
