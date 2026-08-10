import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
} from "../entities/Transaction";

export interface TransactionFilters {
  categoryId?: string;
  transactionType?: "income" | "outcome";
  fromDate?: string;
  toDate?: string;
  search?: string;
  limit?: number;
  startAfter?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string | null;
}

export interface ITransactionRepository {
  create(data: CreateTransactionDTO): Promise<Transaction>;
  update(id: string, data: UpdateTransactionDTO): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Transaction | null>;
  listForUser(
    userId: string,
    filters?: TransactionFilters,
  ): Promise<PaginatedResult<Transaction>>;
}
