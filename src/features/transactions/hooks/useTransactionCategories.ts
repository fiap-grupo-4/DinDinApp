import { useMemo, useRef } from "react";
import { Transaction } from "@domain/transactions/entities/Transaction";
import { Category } from "@domain/categories/entities/Category";
import type { TransactionWithCategory } from "@features/transactions/ui/transaction-list-item";

export function useTransactionCategories(
  transactions: Transaction[],
  categories: Category[],
) {
  const cacheRef = useRef(new WeakMap<Transaction, TransactionWithCategory>());

  const categoriesById = useMemo(() => {
    return new Map(categories.map((category) => [category.uid, category]));
  }, [categories]);

  const transactionsWithCategory = useMemo(() => {
    return transactions.map((transaction) => {
      const category = transaction.categoryId
        ? categoriesById.get(transaction.categoryId)
        : undefined;
      const cached = cacheRef.current.get(transaction);

      if (cached && cached.category === category) return cached;

      const withCategory = { ...transaction, category };
      cacheRef.current.set(transaction, withCategory);
      return withCategory;
    });
  }, [transactions, categoriesById]);

  return transactionsWithCategory;
}
