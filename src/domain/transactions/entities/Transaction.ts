export type TransactionType = "income" | "outcome";

export const TRANSACTION_TYPES: readonly TransactionType[] = [
  "income",
  "outcome",
];

export interface Transaction {
  uid: string;
  userId: string;
  valueInCents: number;
  transactionType: TransactionType;
  createdAt: string;
  description?: string;
  categoryId?: string;
  receipt?: string;
}

export type CreateTransactionDTO = Omit<Transaction, "uid" | "createdAt">;

export type UpdateTransactionDTO = Partial<
  Omit<CreateTransactionDTO, "userId">
>;
