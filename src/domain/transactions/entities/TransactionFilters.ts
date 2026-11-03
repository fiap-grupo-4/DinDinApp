import { TransactionType } from "./Transaction";

export type TransactionFiltersValue = {
  search: string;
  transactionType?: TransactionType;
  categoryId?: string;
  date?: string;
};

export const EMPTY_TRANSACTION_FILTERS: TransactionFiltersValue = {
  search: "",
};
