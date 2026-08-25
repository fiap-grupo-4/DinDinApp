import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
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

export class FirebaseTransactionRepository implements ITransactionRepository {
  async create(data: CreateTransactionDTO): Promise<Transaction> {
    const createdAt = new Date().toISOString();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt,
    });
    return { uid: ref.id, ...data, createdAt } as Transaction;
  }

  async update(id: string, data: UpdateTransactionDTO): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, { ...data });
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
    let q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const lim = filters?.limit ?? 20;
    q = query(q, limit(lim));

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<Transaction, "uid">),
    }));
    return {
      data,
      nextCursor: data.length === lim ? data[data.length - 1].uid : null,
    };
  }
}
