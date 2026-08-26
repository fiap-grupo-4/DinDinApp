import { ScreenHeader } from "@/src/shared/ui/screen-header";
import { Text } from "@/src/shared/ui/text";
import { SavingsGoal } from "@domain/savings/entities/SavingsGoal";
import { useAuthState } from "@features/auth/providers/AuthProvider";
import { useCategories } from "@features/categories/hooks/useCategories";
import { useDashboardMetrics } from "@features/dashboard/hooks/useDashboardMetrics";
import { useSavingsGoals } from "@features/savings/hooks/useSavingsGoals";
import { SavingsGoalFormDrawer } from "@features/savings/ui/savings-goal-form-drawer";
import { useTransactions } from "@features/transactions/hooks/useTransactions";
import { TransactionFiltersValue } from "@features/transactions/ui/transaction-filters-drawer";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { BalanceCard } from "./components/balance-card";
import { BalanceTrendCard } from "./components/balance-trend-card";
import { ExpensesBreakdownCard } from "./components/expenses-breakdown-card";
import { FinancialSummaryCard } from "./components/financial-summary-card";
import { RecentTransactionsCard } from "./components/recent-transactions-card";
import { SavingsGoalsCard } from "./components/savings-goals-card";

const DASHBOARD_FILTERS: TransactionFiltersValue = { search: "" };

export function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthState();
  const [valuesVisible, setValuesVisible] = useState(false);
  const {
    transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    removeTransaction,
  } = useTransactions(DASHBOARD_FILTERS, { limit: null });
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

  function handleAddGoal() {
    setEditingGoal(null);
    setIsDrawerOpen(true);
  }

  function handleEditGoal(goal: SavingsGoal) {
    setEditingGoal(goal);
    setIsDrawerOpen(true);
  }

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
        onToggleVisible={() => setValuesVisible((visible) => !visible)}
      />
      <FinancialSummaryCard
        daily={dailySummary}
        monthly={monthlySummary}
        valuesVisible={valuesVisible}
      />
      <ExpensesBreakdownCard data={expensesByCategory} />
      <BalanceTrendCard data={balanceTrend} />
      <RecentTransactionsCard
        transactions={recentTransactions}
        onSeeMore={() => router.push("/transactions")}
        onEdit={() => router.push("/transactions")}
        onDelete={(transaction) => removeTransaction(transaction.id)}
      />
      <SavingsGoalsCard
        goals={goals}
        onAdd={handleAddGoal}
        onEdit={handleEditGoal}
        onDelete={(goal) => removeGoal(goal.uid)}
      />

      <SavingsGoalFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        goal={editingGoal}
        onSubmit={handleSubmitGoal}
      />
    </ScrollView>
  );
}

export default DashboardScreen;
