import { TransactionRepositoryProvider } from "@features/transactions/providers/TransactionRepositoryProvider";
import TransactionsScreen from "@features/transactions/ui/TransactionsScreen";

export default function Transactions() {
  return (
    <TransactionRepositoryProvider>
      <TransactionsScreen />
    </TransactionRepositoryProvider>
  );
}
