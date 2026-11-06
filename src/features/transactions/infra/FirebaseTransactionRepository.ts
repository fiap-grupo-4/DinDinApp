import {
  addDoc,
  collection,
  deleteField,
  doc,
  documentId,
  getDoc,
  deleteDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@lib/firebase";
import {
  ITransactionRepository,
  PaginatedResult,
  TransactionFilters,
} from "@domain/transactions/repositories/ITransactionRepository";
import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
} from "@domain/transactions/entities/Transaction";

const COLLECTION = "transactions";
const MAX_QUERY_LIMIT = 100;

function omitUndefinedValues<T extends object>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function replaceUndefinedWithDeleteField(
  data: UpdateTransactionDTO,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value === undefined ? deleteField() : value,
    ]),
  );
}

export class FirebaseTransactionRepository implements ITransactionRepository {
  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const createdAt = new Date().toISOString();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...omitUndefinedValues(data),
      createdAt,
    });
    return { uid: ref.id, ...data, createdAt } as Transaction;
  }

  async update(id: string, data: UpdateTransactionDTO): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, replaceUndefinedWithDeleteField(data));
  }

  async delete(id: string): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    await deleteDoc(ref);
  }

  async getById(id: string): Promise<Transaction | null> {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { uid: snap.id, ...(snap.data() as Omit<Transaction, "uid">) };
  }

  async listForUser(
    userId: string,
    filters?: TransactionFilters,
  ): Promise<PaginatedResult<Transaction>> {
    if (filters?.limit !== undefined) {
      return this.listPage(userId, filters, filters.limit);
    }

    const data: Transaction[] = [];
    let cursor = filters?.startAfter;

    do {
      const page = await this.listPage(
        userId,
        { ...filters, startAfter: cursor },
        MAX_QUERY_LIMIT,
        { probeNextPage: false },
      );
      data.push(...page.data);
      cursor = page.nextCursor ?? undefined;
    } while (cursor);

    return { data, nextCursor: null };
  }

  private async listPage(
    userId: string,
    filters: TransactionFilters | undefined,
    pageSize: number,
    { probeNextPage = true }: { probeNextPage?: boolean } = {},
  ): Promise<PaginatedResult<Transaction>> {
    const constraints: QueryConstraint[] = [
      where("userId", "==", userId),
    ];

    if (filters?.transactionType) {
      constraints.push(
        where("transactionType", "==", filters.transactionType),
      );
    }
    if (filters?.categoryId) {
      constraints.push(where("categoryId", "==", filters.categoryId));
    }
    if (filters?.fromDate) {
      constraints.push(where("createdAt", ">=", filters.fromDate));
    }
    if (filters?.toDate) {
      constraints.push(where("createdAt", "<", filters.toDate));
    }

    constraints.push(
      orderBy("createdAt", "desc"),
      orderBy(documentId(), "desc"),
    );

    if (filters?.startAfter) {
      constraints.push(
        startAfter(filters.startAfter.createdAt, filters.startAfter.id),
      );
    }

    const size = Math.min(
      Math.max(pageSize, 1),
      probeNextPage ? MAX_QUERY_LIMIT - 1 : MAX_QUERY_LIMIT,
    );
    constraints.push(limit(probeNextPage ? size + 1 : size));

    const snapshot = await getDocs(
      query(collection(db, COLLECTION), ...constraints),
    );
    const pageDocs = snapshot.docs.slice(0, size);
    const data = pageDocs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<Transaction, "uid">),
    }));
    const lastDocument = pageDocs.at(-1);
    const hasNextPage = probeNextPage
      ? snapshot.docs.length > size
      : snapshot.docs.length === size;

    return {
      data,
      nextCursor:
        hasNextPage && lastDocument
          ? {
              createdAt: lastDocument.get("createdAt") as string,
              id: lastDocument.id,
            }
          : null,
    };
  }
}
