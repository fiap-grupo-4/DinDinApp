import { TransactionRepositoryProvider } from "@features/transactions/providers/TransactionRepositoryProvider";
import TransactionsScreen from "@features/transactions/ui/TransactionsScreen";
import { useRequireAuth } from "@features/auth/hooks/useRequireAuth";

export default function Transactions() {
  useRequireAuth();
  return (
    <TransactionRepositoryProvider>
      <TransactionsScreen />
    </TransactionRepositoryProvider>
  );
}
