import {
  lazyWithPreload,
  useHasBeenTrue,
  usePreloadWhenIdle,
} from "@/src/lib/lazy";
import { toast } from "@/src/lib/sonner";
import { ScreenHeader } from "@/src/shared/ui/screen-header";
import { Skeleton } from "@/src/shared/ui/skeleton";
import { Text } from "@/src/shared/ui/text";
import { SavingsGoal } from "@domain/savings/entities/SavingsGoal";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import { useCategories } from "@presentation/categories/hooks/useCategories";
import { useDashboardMetrics } from "@presentation/dashboard/hooks/useDashboardMetrics";
import type { RecentTransaction } from "@presentation/dashboard/models/dashboard-metrics";
import { useSavingsGoals } from "@presentation/savings/hooks/useSavingsGoals";
import { useTransactions } from "@presentation/transactions/hooks/useTransactions";
import { getSafeErrorMessage } from "@lib/error-messages";
import { EMPTY_TRANSACTION_FILTERS } from "@domain/transactions/entities/TransactionFilters";
import { useRouter } from "expo-router";
import { Suspense, useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { BalanceCard } from "./components/balance-card";
import { FinancialSummaryCard } from "./components/financial-summary-card";
import { RecentTransactionsCard } from "./components/recent-transactions-card";
import { SavingsGoalsCard } from "./components/savings-goals-card";

const ExpensesBreakdownCard = lazyWithPreload(() =>
  import("./components/expenses-breakdown-card").then((module) => ({
    default: module.ExpensesBreakdownCard,
  })),
);

const BalanceTrendCard = lazyWithPreload(() =>
  import("./components/balance-trend-card").then((module) => ({
    default: module.BalanceTrendCard,
  })),
);

const SavingsGoalFormDrawer = lazyWithPreload(
  () => import("@presentation/savings/ui/savings-goal-form-drawer"),
);

const IDLE_PRELOADS = [SavingsGoalFormDrawer];

function ChartCardSkeleton() {
  return <Skeleton className="h-64 w-full rounded-xl" />;
}

function showDeleteError(err: unknown, fallback: string) {
  toast.error(err instanceof Error ? err.message : fallback);
}

export function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthState();
  const [valuesVisible, setValuesVisible] = useState(false);
  const {
    transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    removeTransaction,
  } = useTransactions(EMPTY_TRANSACTION_FILTERS, { limit: null });
  const {
    categories,
    loading: isLoadingCategories,
    error: categoriesError,
  } = useCategories(user?.uid ?? "");
  const {
    goals,
    isLoading: isLoadingGoals,
    error: goalsError,
    addGoal,
    editGoal,
    removeGoal,
  } = useSavingsGoals();
  const {
    currentBalance,
    dailySummary,
    monthlySummary,
    expensesByCategory,
    balanceTrend,
    recentTransactions,
  } = useDashboardMetrics(transactions, categories);

  const isLoading =
    isLoadingTransactions || isLoadingCategories || isLoadingGoals;
  const error = transactionsError || categoriesError || goalsError;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const shouldMountDrawer = useHasBeenTrue(isDrawerOpen);

  usePreloadWhenIdle(IDLE_PRELOADS);

  const handleToggleVisible = useCallback(
    () => setValuesVisible((visible) => !visible),
    [],
  );

  const handleOpenTransactions = useCallback(
    () => router.push("/transactions"),
    [router],
  );

  const handleDeleteTransaction = useCallback(
    (transaction: RecentTransaction) =>
      removeTransaction(transaction.id).catch((err) =>
        showDeleteError(err, "Não foi possível excluir a transação."),
      ),
    [removeTransaction],
  );
  
  function showDeleteError(err: unknown, fallback: string) {
    toast.error(getSafeErrorMessage(err, fallback));
  }

  const handleAddGoal = useCallback(() => {
    setEditingGoal(null);
    setIsDrawerOpen(true);
  }, []);

  const handleEditGoal = useCallback((goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsDrawerOpen(true);
  }, []);

  const handleDeleteGoal = useCallback(
    (goal: SavingsGoal) =>
      removeGoal(goal.uid).catch((err) =>
        showDeleteError(err, "Não foi possível excluir a meta."),
      ),
    [removeGoal],
  );

  async function handleSubmitGoal(data: {
    title: string;
    currentValueInCents: number;
    targetValueInCents: number;
  }) {
    if (editingGoal) {
      await editGoal(editingGoal.uid, data);
    } else {
      await addGoal(data);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-4"
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Início"
        subtitle="Acompanhe seu resumo financeiro e suas metas."
      />
      {isLoading ? <Text variant="muted">Carregando dados...</Text> : null}
      {error ? <Text className="text-destructive text-sm">{error}</Text> : null}
      <BalanceCard
        balance={currentBalance}
        visible={valuesVisible}
        onToggleVisible={handleToggleVisible}
      />
      <FinancialSummaryCard
        daily={dailySummary}
        monthly={monthlySummary}
        valuesVisible={valuesVisible}
      />
      <Suspense fallback={<ChartCardSkeleton />}>
        <ExpensesBreakdownCard data={expensesByCategory} />
      </Suspense>
      <Suspense fallback={<ChartCardSkeleton />}>
        <BalanceTrendCard data={balanceTrend} />
      </Suspense>
      <RecentTransactionsCard
        transactions={recentTransactions}
        onSeeMore={handleOpenTransactions}
        onEdit={handleOpenTransactions}
        onDelete={handleDeleteTransaction}
      />
      <SavingsGoalsCard
        goals={goals}
        onAdd={handleAddGoal}
        onEdit={handleEditGoal}
        onDelete={handleDeleteGoal}
      />

      {shouldMountDrawer ? (
        <Suspense fallback={null}>
          <SavingsGoalFormDrawer
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            goal={editingGoal}
            onSubmit={handleSubmitGoal}
          />
        </Suspense>
      ) : null}
    </ScrollView>
  );
}

export default DashboardScreen;
