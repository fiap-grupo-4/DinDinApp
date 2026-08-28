import { CategoryRepositoryProvider } from "@features/categories/providers/CategoryRepositoryProvider";
import { DashboardScreen } from "@/src/features/dashboard/ui/dashboard-screen";
import { SavingsGoalRepositoryProvider } from "@features/savings/providers/SavingsGoalRepositoryProvider";
import { TransactionRepositoryProvider } from "@features/transactions/providers/TransactionRepositoryProvider";

export default function Dashboard() {
  return (
    <CategoryRepositoryProvider>
      <TransactionRepositoryProvider>
        <SavingsGoalRepositoryProvider>
          <DashboardScreen />
        </SavingsGoalRepositoryProvider>
      </TransactionRepositoryProvider>
    </CategoryRepositoryProvider>
  );
}
