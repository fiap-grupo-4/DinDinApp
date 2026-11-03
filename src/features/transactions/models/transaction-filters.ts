export type TransactionFiltersValue = {
  search: string;
  transactionType?: "income" | "outcome";
  categoryId?: string;
  date?: string;
};
