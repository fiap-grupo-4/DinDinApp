import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useTransactionRepository } from "@features/transactions/providers/TransactionRepositoryProvider";
import { listTransactions } from "@domain/transactions/use-cases/transactionUseCases";
import { Transaction } from "@domain/transactions/entities/Transaction";

export const TransactionsScreen: React.FC = () => {
  const repository = useTransactionRepository();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTransactions(repository, "user-id")
      .then((result) => setTransactions(result.data))
      .catch(() => setError("Não foi possível carregar transações."))
      .finally(() => setLoading(false));
  }, [repository]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Transactions</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <Text>Total loaded: {transactions.length}</Text>
      )}
    </View>
  );
};

export default TransactionsScreen;
