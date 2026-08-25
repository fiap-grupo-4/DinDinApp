import { ScreenHeader } from "@/src/shared/ui/screen-header";
import { SavingsGoal } from "@domain/savings/entities/SavingsGoal";
import { useSavingsGoals } from "@features/savings/hooks/useSavingsGoals";
import { SavingsGoalFormDrawer } from "@features/savings/ui/savings-goal-form-drawer";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import {
  BalanceTrendCard,
  type BalancePoint,
} from "./components/balance-trend-card";
import {
  FinancialSummaryCard,
  type FinancialSummary,
} from "./components/financial-summary-card";
import {
  ExpensesBreakdownCard,
  type ExpenseCategory,
} from "./components/expenses-breakdown-card";
import {
  RecentTransactionsCard,
  type RecentTransaction,
} from "./components/recent-transactions-card";
import { SavingsGoalsCard } from "./components/savings-goals-card";

const DAILY_SUMMARY: FinancialSummary = { income: 150, expense: 150 };
const MONTHLY_SUMMARY: FinancialSummary = { income: 3200, expense: 2450 };

const EXPENSES_DATA: ExpenseCategory[] = [
  { id: "mercado", label: "Mercado", total: 960, color: "#F45B8D" },
  { id: "transporte", label: "Transporte", total: 540, color: "#F5A445" },
  { id: "lazer", label: "Lazer", total: 450, color: "#8B7CF6" },
  { id: "contas", label: "Contas Fixas", total: 420, color: "#B7BDC6" },
  { id: "saude", label: "Saúde", total: 360, color: "#4ECDC4" },
  { id: "outros", label: "Outros", total: 270, color: "#F6C744" },
];

const BALANCE_DATA: BalancePoint[] = [
  { label: "Jan", value: 6000 },
  { label: "Fev", value: 5500 },
  { label: "Mar", value: 9500 },
  { label: "Abr", value: 10000 },
  { label: "Mai", value: 10500 },
  { label: "Jun", value: 10000 },
  { label: "Jul", value: 9500 },
  { label: "Ago", value: 12500 },
];

const RECENT_TRANSACTIONS: RecentTransaction[] = [
  { id: "1", title: "Mercado", amount: 150, date: "12/04/2026" },
  { id: "2", title: "Mercado", amount: 150, date: "12/04/2026" },
  { id: "3", title: "Mercado", amount: 150, date: "12/04/2026" },
  { id: "4", title: "Mercado", amount: 150, date: "12/04/2026" },
  { id: "5", title: "Mercado", amount: 150, date: "12/04/2026" },
];

export function DashboardScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState(RECENT_TRANSACTIONS);
  const { goals, addGoal, editGoal, removeGoal } = useSavingsGoals();

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
      <FinancialSummaryCard daily={DAILY_SUMMARY} monthly={MONTHLY_SUMMARY} />
      <ExpensesBreakdownCard data={EXPENSES_DATA} />
      <BalanceTrendCard data={BALANCE_DATA} />
      <RecentTransactionsCard
        transactions={transactions}
        onSeeMore={() => router.push("/transactions")}
        onEdit={() => router.push("/transactions")}
        onDelete={(transaction) =>
          setTransactions((current) =>
            current.filter((item) => item.id !== transaction.id),
          )
        }
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
