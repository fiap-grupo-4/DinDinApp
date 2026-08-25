import React, { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Button } from "@/src/shared/ui/button";
import { Icon } from "@/src/shared/ui/icon";
import { ScreenHeader } from "@/src/shared/ui/screen-header";
import { Text } from "@/src/shared/ui/text";
import { useAuthState } from "@features/auth/providers/AuthProvider";
import { useCategories } from "@features/categories/hooks/useCategories";
import { useTransactionCategories } from "@features/transactions/hooks/useTransactionCategories";
import { useTransactions } from "@features/transactions/hooks/useTransactions";
import {
  TransactionFiltersDrawer,
  TransactionFiltersValue,
} from "@features/transactions/ui/transaction-filters-drawer";
import {
  TransactionFormDrawer,
  TransactionSubmitData,
} from "@features/transactions/ui/transaction-form-drawer";
import {
  TransactionListItem,
  TransactionWithCategory,
} from "@features/transactions/ui/transaction-list-item";
import { Transaction } from "@domain/transactions/entities/Transaction";
import { ListFilter, Plus } from "lucide-react-native";

const EMPTY_FILTERS: TransactionFiltersValue = { search: "" };

export const TransactionsScreen: React.FC = () => {
  const { user } = useAuthState();
  const { categories } = useCategories(user?.uid ?? "");

  const [filters, setFilters] = useState<TransactionFiltersValue>(EMPTY_FILTERS);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const {
    transactions,
    isLoading,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useTransactions(filters);

  const transactionsWithCategory = useTransactionCategories(
    transactions,
    categories,
  );

  const activeFilterCount = [
    filters.search.trim().length > 0,
    !!filters.transactionType,
    !!filters.categoryId,
    !!filters.date,
  ].filter(Boolean).length;

  function handleAdd() {
    setEditingTransaction(null);
    setIsFormOpen(true);
  }

  function handleEdit(transaction: TransactionWithCategory) {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  }

  function handleDelete(transaction: TransactionWithCategory) {
    Alert.alert(
      "Excluir transação",
      `Tem certeza que deseja excluir "${transaction.description || "esta transação"}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => removeTransaction(transaction.uid),
        },
      ],
    );
  }

  async function handleSubmit(data: TransactionSubmitData) {
    if (editingTransaction) {
      await editTransaction(editingTransaction.uid, data);
    } else {
      await addTransaction(data);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-grow gap-6 px-6 py-8"
    >
      <View className="flex-row items-center justify-between">
        <ScreenHeader
          title="Transações"
          subtitle="Acompanhe suas movimentações financeiras."
        />
        <Button
          className="bg-brand-600 active:bg-brand-700"
          onPress={handleAdd}
        >
          <Text>Nova Transação</Text>
          <Icon as={Plus} size={16} className="text-white" />
        </Button>
      </View>

      <Button
        variant="outline"
        className="self-start"
        onPress={() => setIsFiltersOpen(true)}
      >
        <Icon as={ListFilter} size={16} />
        <Text>
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Text>
      </Button>

      <View className="gap-3">
        {isLoading ? (
          <Text variant="muted">Carregando...</Text>
        ) : error ? (
          <Text variant="muted">{error}</Text>
        ) : transactionsWithCategory.length === 0 ? (
          <View className="items-center justify-center gap-2 py-8">
            <Text variant="muted">Nenhuma transação encontrada.</Text>
          </View>
        ) : (
          transactionsWithCategory.map((transaction) => (
            <TransactionListItem
              key={transaction.uid}
              transaction={transaction}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </View>

      <TransactionFiltersDrawer
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        categories={categories}
        value={filters}
        onApply={setFilters}
      />

      <TransactionFormDrawer
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        transaction={editingTransaction}
        onSubmit={handleSubmit}
      />
    </ScrollView>
  );
};

export default TransactionsScreen;
