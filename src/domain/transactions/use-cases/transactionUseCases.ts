import {
  ITransactionRepository,
  TransactionFilters,
  PaginatedResult,
} from "@domain/transactions/repositories/ITransactionRepository";
import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
} from "@domain/transactions/entities/Transaction";

export async function listTransactions(
  repository: ITransactionRepository,
  userId: string,
  filters?: TransactionFilters,
): Promise<PaginatedResult<Transaction>> {
  return repository.listForUser(userId, filters);
}

export async function getTransaction(
  repository: ITransactionRepository,
  transactionId: string,
): Promise<Transaction | null> {
  return repository.getById(transactionId);
}

export async function createTransaction(
  repository: ITransactionRepository,
  data: CreateTransactionDTO,
): Promise<Transaction> {
  return repository.create(data);
}

export async function updateTransaction(
  repository: ITransactionRepository,
  transactionId: string,
  data: UpdateTransactionDTO,
): Promise<void> {
  return repository.update(transactionId, data);
}

export async function deleteTransaction(
  repository: ITransactionRepository,
  transactionId: string,
): Promise<void> {
  return repository.delete(transactionId);
}
