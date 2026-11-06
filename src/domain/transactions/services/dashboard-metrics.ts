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

// Com `knownCategoryIds`, categoria que não está na lista (ex.: excluída) cai
// em UNCATEGORIZED_ID em vez de virar uma fatia própria.
export function groupMonthlyExpensesByCategory(
  transactions: Transaction[],
  now: Date,
  knownCategoryIds?: ReadonlySet<string>,
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

    const categoryId =
      transaction.categoryId &&
      (!knownCategoryIds || knownCategoryIds.has(transaction.categoryId))
        ? transaction.categoryId
        : UNCATEGORIZED_ID;
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

export type DashboardMetrics = {
  balanceInCents: number;
  daily: PeriodSummary;
  monthly: PeriodSummary;
  monthlyExpensesByCategory: CategoryExpenseTotal[];
  balanceTrend: MonthlyBalance[];
  recentTransactions: Transaction[];
};

export type DashboardMetricsOptions = {
  balanceMonths: number;
  recentLimit: number;
  knownCategoryIds?: ReadonlySet<string>;
};

function monthIndex(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

type TimedTransaction = { transaction: Transaction; time: number };

function insertRecent(
  recent: TimedTransaction[],
  item: TimedTransaction,
  limit: number,
) {
  if (limit <= 0) return;
  if (recent.length === limit && item.time <= recent[limit - 1].time) return;

  let position = recent.findIndex((current) => item.time > current.time);
  if (position === -1) position = recent.length;

  recent.splice(position, 0, item);
  if (recent.length > limit) recent.pop();
}

// Mesmo resultado das funções acima, calculado em uma única passada pela lista.
export function computeDashboardMetrics(
  transactions: Transaction[],
  now: Date,
  { balanceMonths, recentLimit, knownCategoryIds }: DashboardMetricsOptions,
): DashboardMetrics {
  const monthCount = Math.max(0, balanceMonths);
  const currentMonth = monthIndex(now);
  const firstTrendMonth = currentMonth - (monthCount - 1);

  const daily: PeriodSummary = { incomeInCents: 0, expenseInCents: 0 };
  const monthly: PeriodSummary = { incomeInCents: 0, expenseInCents: 0 };
  const expensesByCategory = new Map<string, number>();
  const monthDeltas = new Array<number>(monthCount).fill(0);
  const recent: TimedTransaction[] = [];

  let balanceInCents = 0;
  let balanceBeforeTrend = 0;
  let hasDatedTransactions = false;

  for (const transaction of transactions) {
    const signedValue = signedValueInCents(transaction);
    balanceInCents += signedValue;

    const date = toValidDate(transaction.createdAt);
    insertRecent(
      recent,
      { transaction, time: date?.getTime() ?? 0 },
      recentLimit,
    );

    if (!date) continue;
    hasDatedTransactions = true;

    const month = monthIndex(date);
    const trendPosition = month - firstTrendMonth;
    if (trendPosition < 0) {
      balanceBeforeTrend += signedValue;
    } else if (trendPosition < monthCount) {
      monthDeltas[trendPosition] += signedValue;
    }

    if (month !== currentMonth) continue;

    const isToday = isSameDay(date, now);
    if (transaction.transactionType === "income") {
      monthly.incomeInCents += transaction.valueInCents;
      if (isToday) daily.incomeInCents += transaction.valueInCents;
      continue;
    }

    monthly.expenseInCents += transaction.valueInCents;
    if (isToday) daily.expenseInCents += transaction.valueInCents;

    const categoryId =
      transaction.categoryId &&
      (!knownCategoryIds || knownCategoryIds.has(transaction.categoryId))
        ? transaction.categoryId
        : UNCATEGORIZED_ID;
    expensesByCategory.set(
      categoryId,
      (expensesByCategory.get(categoryId) ?? 0) + transaction.valueInCents,
    );
  }

  let runningBalance = balanceBeforeTrend;
  const balanceTrend =
    hasDatedTransactions && monthCount > 0
      ? monthDeltas.map((delta, index) => {
          runningBalance += delta;
          return {
            month: new Date(
              now.getFullYear(),
              now.getMonth() - (monthCount - 1) + index,
              1,
            ),
            balanceInCents: runningBalance,
          };
        })
      : [];

  return {
    balanceInCents,
    daily,
    monthly,
    monthlyExpensesByCategory: [...expensesByCategory.entries()]
      .sort((left, right) => right[1] - left[1])
      .map(([categoryId, totalInCents]) => ({ categoryId, totalInCents })),
    balanceTrend,
    recentTransactions: recent.map((item) => item.transaction),
  };
}
