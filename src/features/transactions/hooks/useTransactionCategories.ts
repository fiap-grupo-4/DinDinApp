import { useMemo } from "react";
import { Transaction } from "@domain/transactions/entities/Transaction";
import { Category } from "@domain/categories/entities/Category";

export function useTransactionCategories(
  transactions: Transaction[],
  categories: Category[],
) {
  const categoriesById = useMemo(() => {
    return new Map(categories.map((category) => [category.uid, category]));
  }, [categories]);

  const transactionsWithCategory = useMemo(() => {
    return transactions.map((transaction) => ({
      ...transaction,
      category: transaction.categoryId
        ? categoriesById.get(transaction.categoryId)
        : undefined,
    }));
  }, [transactions, categoriesById]);

  return transactionsWithCategory;
}
