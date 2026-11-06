import { Observable, Subject } from "rxjs";
import {
  CreateTransactionDTO,
  Transaction,
  UpdateTransactionDTO,
} from "@domain/transactions/entities/Transaction";
import { TransactionChange } from "@domain/transactions/events/TransactionChange";
import {
  ITransactionRepository,
  PaginatedResult,
  TransactionFilters,
} from "@domain/transactions/repositories/ITransactionRepository";

export class ObservableTransactionRepository implements ITransactionRepository {
  private readonly changesSubject = new Subject<TransactionChange>();

  readonly changes$: Observable<TransactionChange> =
    this.changesSubject.asObservable();

  constructor(private readonly inner: ITransactionRepository) {}

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const transaction = await this.inner.create(data);
    this.changesSubject.next({ type: "created", transaction });
    return transaction;
  }

  async update(id: string, data: UpdateTransactionDTO): Promise<void> {
    await this.inner.update(id, data);
    this.changesSubject.next({ type: "updated", transactionId: id, data });
  }

  async delete(id: string): Promise<void> {
    await this.inner.delete(id);
    this.changesSubject.next({ type: "deleted", transactionId: id });
  }

  getById(id: string): Promise<Transaction | null> {
    return this.inner.getById(id);
  }

  listForUser(
    userId: string,
    filters?: TransactionFilters,
  ): Promise<PaginatedResult<Transaction>> {
    return this.inner.listForUser(userId, filters);
  }
}
