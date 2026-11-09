import {
  Transaction,
  UpdateTransactionDTO,
} from "@domain/transactions/entities/Transaction";

export type TransactionChange =
  | { type: "created"; transaction: Transaction }
  | { type: "updated"; transactionId: string; data: UpdateTransactionDTO }
  | { type: "deleted"; transactionId: string };

export function applyTransactionChange(
  transactions: Transaction[],
  change: TransactionChange,
): Transaction[] {
  switch (change.type) {
    case "created":
      return [
        change.transaction,
        ...transactions.filter(
          (transaction) => transaction.uid !== change.transaction.uid,
        ),
      ];
    case "updated":
      return transactions.map((transaction) =>
        transaction.uid === change.transactionId
          ? { ...transaction, ...change.data }
          : transaction,
      );
    case "deleted":
      return transactions.filter(
        (transaction) => transaction.uid !== change.transactionId,
      );
  }
}
