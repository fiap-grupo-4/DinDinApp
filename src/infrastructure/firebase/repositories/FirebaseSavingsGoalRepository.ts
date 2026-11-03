import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@lib/firebase";
import { ISavingsGoalRepository } from "@domain/savings/repositories/ISavingsGoalRepository";
import {
  SavingsGoal,
  CreateSavingsGoalDTO,
  UpdateSavingsGoalDTO,
} from "@domain/savings/entities/SavingsGoal";

const COLLECTION = "savingsGoals";

export class FirebaseSavingsGoalRepository implements ISavingsGoalRepository {
  async create(data: CreateSavingsGoalDTO): Promise<SavingsGoal> {
    const createdAt = new Date().toISOString();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt,
    });
    return { uid: ref.id, ...data, createdAt } as SavingsGoal;
  }

  async update(id: string, data: UpdateSavingsGoalDTO): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, { ...data });
  }

  async delete(id: string): Promise<void> {
    const ref = doc(db, COLLECTION, id);
    await deleteDoc(ref);
  }

  async listForUser(userId: string): Promise<SavingsGoal[]> {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<SavingsGoal, "uid">),
    }));
  }
}
