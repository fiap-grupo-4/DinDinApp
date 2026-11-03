import {
  CreateTransactionDTO,
  Transaction,
  UpdateTransactionDTO,
} from "@domain/transactions/entities/Transaction";
import {
  ITransactionRepository,
  PaginatedResult,
  TransactionFilters,
} from "@domain/transactions/repositories/ITransactionRepository";

export class InMemoryTransactionRepository implements ITransactionRepository {
  items = new Map<string, Transaction>();
  calls = {
    create: [] as CreateTransactionDTO[],
    update: [] as { id: string; data: UpdateTransactionDTO }[],
    delete: [] as string[],
    listForUser: [] as { userId: string; filters?: TransactionFilters }[],
  };
  private counter = 0;

  seed(...transactions: Transaction[]): void {
    for (const transaction of transactions) {
      this.items.set(transaction.uid, transaction);
    }
  }

  get writeCount(): number {
    return (
      this.calls.create.length +
      this.calls.update.length +
      this.calls.delete.length
    );
  }

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    this.calls.create.push(data);
    this.counter += 1;
    const transaction: Transaction = {
      ...data,
      uid: `tx-${this.counter}`,
      createdAt: new Date(2026, 5, 15, 12).toISOString(),
    };
    this.items.set(transaction.uid, transaction);
    return transaction;
  }

  async update(id: string, data: UpdateTransactionDTO): Promise<void> {
    this.calls.update.push({ id, data });
    const current = this.items.get(id);
    if (!current) return;
    const next = { ...current } as Record<string, unknown>;
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) delete next[key];
      else next[key] = value;
    }
    this.items.set(id, next as unknown as Transaction);
  }

  async delete(id: string): Promise<void> {
    this.calls.delete.push(id);
    this.items.delete(id);
  }

  async getById(id: string): Promise<Transaction | null> {
    return this.items.get(id) ?? null;
  }

  async listForUser(
    userId: string,
    filters?: TransactionFilters,
  ): Promise<PaginatedResult<Transaction>> {
    this.calls.listForUser.push({ userId, filters });
    const data = [...this.items.values()].filter(
      (item) => item.userId === userId,
    );
    return { data, nextCursor: null };
  }
}
