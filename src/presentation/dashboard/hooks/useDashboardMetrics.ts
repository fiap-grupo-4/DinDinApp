import { fromCents } from "@/src/lib/currency";
import { Category } from "@domain/categories/entities/Category";
import { Transaction } from "@domain/transactions/entities/Transaction";
import {
  buildMonthlyBalanceTrend,
  calculateBalanceInCents,
  getRecentTransactions,
  groupMonthlyExpensesByCategory,
  summarizeDay,
  summarizeMonth,
  PeriodSummary,
} from "@domain/transactions/services/dashboard-metrics";
import {
  isSameDay,
  toValidDate,
} from "@domain/transactions/services/transaction-dates";
import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
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

function formatSummary(summary: PeriodSummary): FinancialSummary {
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

// Data de referência que vira à meia-noite e ao voltar do background, para o
// resumo do dia e do mês não ficar preso na data em que a tela abriu.
function useToday(): Date {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const nextMidnight = new Date(today);
    nextMidnight.setHours(24, 0, 0, 0);
    const timeout = setTimeout(
      () => setToday(new Date()),
      nextMidnight.getTime() - Date.now(),
    );

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && !isSameDay(new Date(), today)) {
        setToday(new Date());
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [today]);

  return today;
}

export function useDashboardMetrics(
  transactions: Transaction[],
  categories: Category[],
) {
  const now = useToday();

  return useMemo(() => {
    const categoryNames = new Map(
      categories.map((category) => [category.uid, category.name]),
    );

    const expensesByCategory: ExpenseCategory[] =
      groupMonthlyExpensesByCategory(
        transactions,
        now,
        new Set(categoryNames.keys()),
      ).map(
        ({ categoryId, totalInCents }, index) => ({
          id: categoryId,
          label: categoryNames.get(categoryId) ?? "Outros",
          total: fromCents(totalInCents),
          color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
        }),
      );

    const balanceTrend: BalancePoint[] = buildMonthlyBalanceTrend(
      transactions,
      now,
      BALANCE_MONTHS,
    ).map(({ month, balanceInCents }) => ({
      label: formatMonthLabel(month),
      value: fromCents(balanceInCents),
    }));

    const recentTransactions: RecentTransaction[] = getRecentTransactions(
      transactions,
      RECENT_TRANSACTIONS_LIMIT,
    ).map((transaction) => ({
      id: transaction.uid,
      title: transaction.description || "Transação",
      amount: fromCents(transaction.valueInCents),
      transactionType: transaction.transactionType,
      date:
        toValidDate(transaction.createdAt)?.toLocaleDateString("pt-BR") ?? "",
    }));

    return {
      currentBalance: fromCents(calculateBalanceInCents(transactions)),
      dailySummary: formatSummary(summarizeDay(transactions, now)),
      monthlySummary: formatSummary(summarizeMonth(transactions, now)),
      expensesByCategory,
      balanceTrend,
      recentTransactions,
    };
  }, [transactions, categories, now]);
}
