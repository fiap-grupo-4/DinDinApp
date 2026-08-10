export interface Category {
  uid: string;
  userId: string;
  name: string;
  createdAt: string;
}

export type CreateCategoryDTO = Omit<Category, "uid" | "createdAt">;
