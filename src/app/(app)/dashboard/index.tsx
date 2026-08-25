import { DashboardScreen } from "@/src/features/dashboard/ui/dashboard-screen";
import { SavingsGoalRepositoryProvider } from "@features/savings/providers/SavingsGoalRepositoryProvider";

export default function Dashboard() {
  return (
    <SavingsGoalRepositoryProvider>
      <DashboardScreen />
    </SavingsGoalRepositoryProvider>
  );
}
