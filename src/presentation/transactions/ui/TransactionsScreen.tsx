import {
  lazyWithPreload,
  useHasBeenTrue,
  usePreloadWhenIdle,
} from "@/src/lib/lazy";
import { useDebouncedText } from "@/src/lib/reactive";
import { toast } from "@/src/lib/sonner";
import { getSafeErrorMessage } from "@lib/error-messages";
import { Button } from "@/src/shared/ui/button";
import { Icon } from "@/src/shared/ui/icon";
import { IconInput } from "@/src/shared/ui/icon-input";
import { ScreenHeader } from "@/src/shared/ui/screen-header";
import { Text } from "@/src/shared/ui/text";
import { Transaction } from "@domain/transactions/entities/Transaction";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import { useCategories } from "@presentation/categories/hooks/useCategories";
import { useTransactionCategories } from "@presentation/transactions/hooks/useTransactionCategories";
import { useTransactions } from "@presentation/transactions/hooks/useTransactions";
import {
  selectActiveFilterCount,
  selectSearch,
  useTransactionFiltersStore,
} from "@presentation/transactions/stores/transactionFiltersStore";
import type { TransactionSubmitData } from "@presentation/transactions/ui/transaction-form-drawer";
import {
  TransactionListItem,
  TransactionWithCategory,
} from "@presentation/transactions/ui/transaction-list-item";
import { ListFilter, Plus, Search } from "lucide-react-native";
import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  type ListRenderItem,
  Platform,
  View,
} from "react-native";

const TransactionFiltersDrawer = lazyWithPreload(
  () => import("@presentation/transactions/ui/transaction-filters-drawer"),
);

const TransactionFormDrawer = lazyWithPreload(
  () => import("@presentation/transactions/ui/transaction-form-drawer"),
);

const IDLE_PRELOADS = [TransactionFormDrawer, TransactionFiltersDrawer];

function keyExtractor(transaction: TransactionWithCategory) {
  return transaction.uid;
}

function ItemSeparator() {
  return <View className="h-3" />;
}

export const TransactionsScreen: React.FC = () => {
  const { user } = useAuthState();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories(user?.uid ?? "");

  const search = useTransactionFiltersStore(selectSearch);
  const activeFilterCount = useTransactionFiltersStore(selectActiveFilterCount);
  const setSearch = useTransactionFiltersStore((state) => state.setSearch);

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const shouldMountFilters = useHasBeenTrue(isFiltersOpen);
  const shouldMountForm = useHasBeenTrue(isFormOpen);

  usePreloadWhenIdle(IDLE_PRELOADS);

  const {
    transactions,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
    refresh,
    loadMore,
  } = useTransactions();

  const transactionsWithCategory = useTransactionCategories(
    transactions,
    categories,
  );

  const [searchText, setSearchText] = useState(search);
  const emitSearch = useDebouncedText((value) => setSearch(value));

  useEffect(() => {
    setSearchText(search);
  }, [search]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      emitSearch(text);
    },
    [emitSearch],
  );

  const hasSearch = search.length > 0;

  const handleAdd = useCallback(() => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    (transaction: TransactionWithCategory) => {
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
    },
    [removeTransaction],
  );

  const renderItem = useCallback<ListRenderItem<TransactionWithCategory>>(
    ({ item }) => (
      <TransactionListItem
        transaction={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    [handleEdit, handleDelete],
  );

  async function handleSubmit(data: TransactionSubmitData) {
    if (editingTransaction) {
      await editTransaction(editingTransaction.uid, data);
    } else {
      await addTransaction(data);
    }
  }

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const handleEndReached = useCallback(() => {
    if (!isLoading && !hasSearch) loadMore();
  }, [isLoading, hasSearch, loadMore]);

  const listHeader = useMemo(
    () => (
      <View className="gap-6 pb-6">
        <ScreenHeader
          title="Transações"
          subtitle="Acompanhe suas movimentações financeiras."
        />

        <IconInput
          icon={Search}
          value={searchText}
          onChangeText={handleSearchChange}
          placeholder="Buscar transações..."
          accessibilityLabel="Buscar transações"
          returnKeyType="search"
          autoCorrect={false}
        />

        <View className="flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onPressIn={() => void TransactionFiltersDrawer.preload()}
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
            onPressIn={() => void TransactionFormDrawer.preload()}
            onPress={handleAdd}
          >
            <Icon as={Plus} size={16} className="text-white" />
            <Text>Nova Transação</Text>
          </Button>
        </View>
      </View>
    ),
    [activeFilterCount, handleAdd, handleSearchChange, searchText],
  );

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={transactionsWithCategory}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        contentContainerClassName="flex-grow px-6 py-8"
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={listHeader}
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
                <Button variant="outline" onPress={loadMore}>
                  <Text>
                    {hasSearch
                      ? "Buscar nas próximas transações"
                      : "Carregar mais"}
                  </Text>
                </Button>
              ) : null}
            </View>
          ) : undefined
        }
      />

      {shouldMountFilters ? (
        <Suspense fallback={null}>
          <TransactionFiltersDrawer
            open={isFiltersOpen}
            onOpenChange={setIsFiltersOpen}
            categories={categories}
          />
        </Suspense>
      ) : null}

      {shouldMountForm ? (
        <Suspense fallback={null}>
          <TransactionFormDrawer
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            transaction={editingTransaction}
            categories={categories}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            onSubmit={handleSubmit}
          />
        </Suspense>
      ) : null}
    </View>
  );
};

export default TransactionsScreen;
