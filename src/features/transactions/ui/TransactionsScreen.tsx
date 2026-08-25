import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { ScreenHeader } from "@/src/shared/ui/screen-header";
import { Text } from "@/src/shared/ui/text";
import { useTransactionRepository } from "@features/transactions/providers/TransactionRepositoryProvider";
import { listTransactions } from "@domain/transactions/use-cases/transactionUseCases";
import { Transaction } from "@domain/transactions/entities/Transaction";
import { useAuthState } from "../../auth/providers/AuthProvider";

export const TransactionsScreen: React.FC = () => {
  const repository = useTransactionRepository();
  const { user } = useAuthState();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    listTransactions(repository, user.uid)
      .then((result) => setTransactions(result.data))
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar transações.",
        );
      })
      .finally(() => setLoading(false));
  }, [repository]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-grow gap-6 px-6 py-8"
    >
      <ScreenHeader
        title="Transações"
        subtitle="Acompanhe suas movimentações financeiras."
      />

      <View className="items-center justify-center gap-2">
        {loading ? (
          <Text variant="muted">Carregando...</Text>
        ) : error ? (
          <Text variant="muted">{error}</Text>
        ) : (
          <Text variant="muted">
            Total carregado: {transactions.length}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default TransactionsScreen;
