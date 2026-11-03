import { Transaction } from "@domain/transactions/entities/Transaction";

export type SummaryInCents = {
  incomeInCents: number;
  expenseInCents: number;
};

export type CategoryExpenseInCents = {
  categoryId: string;
  totalInCents: number;
};

export type MonthlyBalanceInCents = {
  month: Date;
  balanceInCents: number;
};

export type TransactionMetrics = {
  balanceInCents: number;
  daily: SummaryInCents;
  monthly: SummaryInCents;
  monthlyExpensesByCategory: CategoryExpenseInCents[];
  balanceTrend: MonthlyBalanceInCents[];
  recentTransactions: Transaction[];
};

export type TransactionMetricsOptions = {
  now?: Date;
  balanceMonths?: number;
  recentLimit?: number;
};

export const UNCATEGORIZED_ID = "other";

function monthIndex(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

function insertRecent(
  recent: { transaction: Transaction; time: number }[],
  item: { transaction: Transaction; time: number },
  limit: number,
) {
  if (limit <= 0) return;
  if (recent.length === limit && item.time <= recent[limit - 1].time) return;

  let position = recent.findIndex((current) => item.time > current.time);
  if (position === -1) position = recent.length;

  recent.splice(position, 0, item);
  if (recent.length > limit) recent.pop();
}

export function computeTransactionMetrics(
  transactions: Transaction[],
  {
    now = new Date(),
    balanceMonths = 8,
    recentLimit = 5,
  }: TransactionMetricsOptions = {},
): TransactionMetrics {
  const today = now.toDateString();
  const currentMonth = monthIndex(now);
  const firstTrendMonth = currentMonth - (balanceMonths - 1);

  const daily: SummaryInCents = { incomeInCents: 0, expenseInCents: 0 };
  const monthly: SummaryInCents = { incomeInCents: 0, expenseInCents: 0 };
  const expensesByCategory = new Map<string, number>();
  const monthDeltas = new Array<number>(balanceMonths).fill(0);
  const recent: { transaction: Transaction; time: number }[] = [];

  let balanceInCents = 0;
  let balanceBeforeTrend = 0;
  let hasDatedTransactions = false;

  for (const transaction of transactions) {
    const isIncome = transaction.transactionType === "income";
    const signedValue = isIncome
      ? transaction.valueInCents
      : -transaction.valueInCents;
    balanceInCents += signedValue;

    const date = new Date(transaction.createdAt);
    const time = date.getTime();

    insertRecent(
      recent,
      { transaction, time: Number.isNaN(time) ? 0 : time },
      recentLimit,
    );

    if (Number.isNaN(time)) continue;
    hasDatedTransactions = true;

    const month = monthIndex(date);
    const trendPosition = month - firstTrendMonth;
    if (trendPosition < 0) {
      balanceBeforeTrend += signedValue;
    } else if (trendPosition < balanceMonths) {
      monthDeltas[trendPosition] += signedValue;
    }

    if (month !== currentMonth) continue;

    const isToday = date.toDateString() === today;
    if (isIncome) {
      monthly.incomeInCents += transaction.valueInCents;
      if (isToday) daily.incomeInCents += transaction.valueInCents;
      continue;
    }

    monthly.expenseInCents += transaction.valueInCents;
    if (isToday) daily.expenseInCents += transaction.valueInCents;

    const categoryId = transaction.categoryId || UNCATEGORIZED_ID;
    expensesByCategory.set(
      categoryId,
      (expensesByCategory.get(categoryId) ?? 0) + transaction.valueInCents,
    );
  }

  let runningBalance = balanceBeforeTrend;
  const balanceTrend = hasDatedTransactions
    ? monthDeltas.map((delta, index) => {
        runningBalance += delta;
        return {
          month: new Date(
            now.getFullYear(),
            now.getMonth() - (balanceMonths - 1) + index,
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
      .map(([categoryId, totalInCents]) => ({ categoryId, totalInCents }))
      .sort((left, right) => right.totalInCents - left.totalInCents),
    balanceTrend,
    recentTransactions: recent.map((item) => item.transaction),
  };
}
