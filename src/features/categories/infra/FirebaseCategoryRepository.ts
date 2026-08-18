import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@lib/firebase";
import { ICategoryRepository } from "@domain/categories/repositories/ICategoryRepository";
import {
  Category,
  CreateCategoryDTO,
} from "@domain/categories/entities/Category";

const COLLECTION = "categories";

export class FirebaseCategoryRepository implements ICategoryRepository {
  async create(data: CreateCategoryDTO): Promise<Category> {
    const createdAt = new Date().toISOString();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt,
    });
    return { uid: ref.id, ...data, createdAt } as Category;
  }

  async getById(id: string): Promise<Category | null> {
    const ref = doc(db, COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { uid: snap.id, ...(snap.data() as Omit<Category, "uid">) };
  }

  async listForUser(userId: string): Promise<Category[]> {
    const q = query(collection(db, COLLECTION), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...(doc.data() as Omit<Category, "uid">),
    }));
  }
}
