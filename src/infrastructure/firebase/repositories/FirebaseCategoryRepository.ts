import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "@infra/firebase";
import { isPermissionDenied } from "@infra/firebase/errors";
import { logger } from "../../logging/logger";
import { ICategoryRepository } from "@domain/categories/repositories/ICategoryRepository";
import {
  Category,
  CreateCategoryDTO,
} from "@domain/categories/entities/Category";

const COLLECTION = "categories";
const MAX_QUERY_LIMIT = 100;

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
    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { uid: snap.id, ...(snap.data() as Omit<Category, "uid">) };
    } catch (error) {
      if (isPermissionDenied(error)) {
        // Também cobre sessão expirada ou regra quebrada; fica no log.
        logger.warn("firestore.category_read_denied", error);
        return null;
      }
      throw error;
    }
  }

  async listForUser(userId: string): Promise<Category[]> {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      limit(MAX_QUERY_LIMIT),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...(doc.data() as Omit<Category, "uid">),
    }));
  }
}
