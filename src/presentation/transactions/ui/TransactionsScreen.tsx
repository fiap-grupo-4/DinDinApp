import { toast } from "@/src/lib/sonner";
import { getSafeErrorMessage } from "@lib/error-messages";
import { Button } from "@/src/shared/ui/button";
import { Icon } from "@/src/shared/ui/icon";
import { ScreenHeader } from "@/src/shared/ui/screen-header";
import { Text } from "@/src/shared/ui/text";
import { Transaction } from "@domain/transactions/entities/Transaction";
import {
  EMPTY_TRANSACTION_FILTERS,
  TransactionFiltersValue,
} from "@domain/transactions/entities/TransactionFilters";
import { countActiveFilters } from "@domain/transactions/services/transaction-filters";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import { useCategories } from "@presentation/categories/hooks/useCategories";
import { useTransactionCategories } from "@presentation/transactions/hooks/useTransactionCategories";
import { useTransactions } from "@presentation/transactions/hooks/useTransactions";
import { TransactionFiltersDrawer } from "@presentation/transactions/ui/transaction-filters-drawer";
import {
  TransactionFormDrawer,
  TransactionSubmitData,
} from "@presentation/transactions/ui/transaction-form-drawer";
import {
  TransactionListItem,
  TransactionWithCategory,
} from "@presentation/transactions/ui/transaction-list-item";
import { ListFilter, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";

export const TransactionsScreen: React.FC = () => {
  const { user } = useAuthState();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories(user?.uid ?? "");

  const [filters, setFilters] = useState<TransactionFiltersValue>(
    EMPTY_TRANSACTION_FILTERS,
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const {
    transactions,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
    refresh,
    loadMore,
  } = useTransactions(filters);

  const transactionsWithCategory = useTransactionCategories(
    transactions,
    categories,
  );

  const activeFilterCount = countActiveFilters(filters);

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
          onPress: () => {
            removeTransaction(transaction.uid).catch((err) =>
              toast.error(
                getSafeErrorMessage(
                  err,
                  "Não foi possível excluir a transação.",
                ),
              ),
            );
          },
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
    <View className="flex-1 bg-background">
      <FlatList
        data={transactionsWithCategory}
        keyExtractor={(transaction) => transaction.uid}
        renderItem={({ item }) => (
          <TransactionListItem
            transaction={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerClassName="flex-grow px-6 py-8"
        showsVerticalScrollIndicator={false}
        refreshing={isLoading && transactionsWithCategory.length > 0}
        onRefresh={() => void refresh()}
        onEndReached={() => {
          if (!isLoading && !filters.search.trim()) void loadMore();
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View className="gap-6 pb-6">
            <ScreenHeader
              title="Transações"
              subtitle="Acompanhe suas movimentações financeiras."
            />

            <View className="flex-row items-center justify-between gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => setIsFiltersOpen(true)}
              >
                <Icon as={ListFilter} size={16} />
                <Text>
                  Filtros
                  {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </Text>
              </Button>
              <Button
                className="flex-1 bg-brand-600 active:bg-brand-700"
                onPress={handleAdd}
              >
                <Icon as={Plus} size={16} className="text-white" />
                <Text>Nova Transação</Text>
              </Button>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center gap-2 py-8">
            {isLoading ? (
              <>
                <ActivityIndicator />
                <Text variant="muted">Carregando...</Text>
              </>
            ) : error ? (
              <Text className="text-destructive text-center text-sm">
                {error}
              </Text>
            ) : (
              <Text variant="muted">Nenhuma transação encontrada.</Text>
            )}
          </View>
        }
        ListFooterComponent={
          !isLoading && (hasMore || isLoadingMore || error) ? (
            <View className="items-center gap-3 pt-4">
              {error && transactionsWithCategory.length > 0 ? (
                <Text className="text-destructive text-center text-sm">
                  {error}
                </Text>
              ) : null}
              {isLoadingMore ? (
                <ActivityIndicator />
              ) : hasMore ? (
                <Button variant="outline" onPress={() => void loadMore()}>
                  <Text>
                    {filters.search.trim()
                      ? "Buscar nas próximas transações"
                      : "Carregar mais"}
                  </Text>
                </Button>
              ) : null}
            </View>
          ) : null
        }
      />

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
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

export default TransactionsScreen;
