export type FinancialSummary = {
  income: number;
  expense: number;
};

export type ExpenseCategory = {
  id: string;
  label: string;
  total: number;
  color: string;
};

export type BalancePoint = {
  label: string;
  value: number;
};

export type RecentTransaction = {
  id: string;
  title: string;
  amount: number;
  transactionType: "income" | "outcome";
  date: string;
};
