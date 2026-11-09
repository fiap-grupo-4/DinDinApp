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
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "@infra/firebase";
import { isPermissionDenied } from "@infra/firebase/errors";
import { logger } from "../../logging/logger";
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

  async getById(id: string): Promise<SavingsGoal | null> {
    const ref = doc(db, COLLECTION, id);
    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { uid: snap.id, ...(snap.data() as Omit<SavingsGoal, "uid">) };
    } catch (error) {
      if (isPermissionDenied(error)) {
        // Também cobre sessão expirada ou regra quebrada; fica no log.
        logger.warn("firestore.savings_goal_read_denied", error);
        return null;
      }
      throw error;
    }
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
      limit(100),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      uid: d.id,
      ...(d.data() as Omit<SavingsGoal, "uid">),
    }));
  }
}
