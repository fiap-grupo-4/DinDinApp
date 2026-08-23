export interface Transaction {
  uid: string;
  userId: string;
  valueInCents: number;
  transactionType: "income" | "outcome";
  createdAt: string;
  description?: string;
  categoryId?: string;
  receipt?: string;
}

export type CreateTransactionDTO = Omit<Transaction, "uid" | "createdAt">;

export type UpdateTransactionDTO = Partial<CreateTransactionDTO>;
