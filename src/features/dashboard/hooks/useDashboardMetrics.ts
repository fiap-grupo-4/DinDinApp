import { fromCents } from "@/src/lib/currency";
import { Category } from "@domain/categories/entities/Category";
import { Transaction } from "@domain/transactions/entities/Transaction";
import {
  computeTransactionMetrics,
  type SummaryInCents,
} from "@domain/transactions/services/transactionMetrics";
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

function toFinancialSummary(summary: SummaryInCents): FinancialSummary {
  return {
    income: fromCents(summary.incomeInCents),
    expense: fromCents(summary.expenseInCents),
  };
}

function formatMonthLabel(month: Date): string {
  const label = month
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR");
}

export function useDashboardMetrics(
  transactions: Transaction[],
  categories: Category[],
) {
  const metrics = useMemo(
    () =>
      computeTransactionMetrics(transactions, {
        balanceMonths: BALANCE_MONTHS,
        recentLimit: RECENT_TRANSACTIONS_LIMIT,
      }),
    [transactions],
  );

  const transactionMetrics = useMemo(() => {
    const balanceTrend: BalancePoint[] = metrics.balanceTrend.map((point) => ({
      label: formatMonthLabel(point.month),
      value: fromCents(point.balanceInCents),
    }));

    const recentTransactions: RecentTransaction[] =
      metrics.recentTransactions.map((transaction) => ({
        id: transaction.uid,
        title: transaction.description || "Transação",
        amount: fromCents(transaction.valueInCents),
        transactionType: transaction.transactionType,
        date: formatDate(transaction.createdAt),
      }));

    return {
      currentBalance: fromCents(metrics.balanceInCents),
      dailySummary: toFinancialSummary(metrics.daily),
      monthlySummary: toFinancialSummary(metrics.monthly),
      balanceTrend,
      recentTransactions,
    };
  }, [metrics]);

  const expensesByCategory = useMemo<ExpenseCategory[]>(() => {
    const categoryNames = new Map(
      categories.map((category) => [category.uid, category.name]),
    );

    return metrics.monthlyExpensesByCategory.map((expense, index) => ({
      id: expense.categoryId,
      label: categoryNames.get(expense.categoryId) ?? "Outros",
      total: fromCents(expense.totalInCents),
      color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
    }));
  }, [metrics, categories]);

  return useMemo(
    () => ({ ...transactionMetrics, expensesByCategory }),
    [transactionMetrics, expensesByCategory],
  );
}
