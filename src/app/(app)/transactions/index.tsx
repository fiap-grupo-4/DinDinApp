import { CategoryRepositoryProvider } from "@features/categories/providers/CategoryRepositoryProvider";
import { TransactionRepositoryProvider } from "@features/transactions/providers/TransactionRepositoryProvider";
import TransactionsScreen from "@features/transactions/ui/TransactionsScreen";

export default function Transactions() {
  return (
    <CategoryRepositoryProvider>
      <TransactionRepositoryProvider>
        <TransactionsScreen />
      </TransactionRepositoryProvider>
    </CategoryRepositoryProvider>
  );
}
