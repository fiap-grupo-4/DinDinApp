import { Transaction } from "../entities/Transaction";
import { TransactionFiltersValue } from "../entities/TransactionFilters";
import { isSameDay, toValidDate } from "./transaction-dates";

export type DateRange = {
  fromDate?: string;
  toDate?: string;
};

export function getDayRange(dateValue?: string): DateRange {
  if (!dateValue) return {};

  const selectedDate = toValidDate(dateValue);
  if (!selectedDate) return {};

  const start = new Date(selectedDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    fromDate: start.toISOString(),
    toDate: end.toISOString(),
  };
}

export function countActiveFilters(filters: TransactionFiltersValue): number {
  return [
    filters.search.trim().length > 0,
    !!filters.transactionType,
    !!filters.categoryId,
    !!filters.date,
  ].filter(Boolean).length;
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFiltersValue,
): Transaction[] {
  const search = filters.search.trim().toLowerCase();
  const selectedDate = filters.date ? toValidDate(filters.date) : null;

  return transactions.filter((transaction) => {
    if (
      filters.transactionType &&
      transaction.transactionType !== filters.transactionType
    ) {
      return false;
    }

    if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
      return false;
    }

    if (selectedDate) {
      const transactionDate = toValidDate(transaction.createdAt);
      if (!transactionDate || !isSameDay(transactionDate, selectedDate)) {
        return false;
      }
    }

    if (
      search &&
      !(transaction.description ?? "").toLowerCase().includes(search)
    ) {
      return false;
    }

    return true;
  });
}
