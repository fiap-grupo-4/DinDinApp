import {
  Category,
  CreateCategoryDTO,
} from "@domain/categories/entities/Category";

export interface ICategoryRepository {
  create(data: CreateCategoryDTO): Promise<Category>;
  getById(id: string): Promise<Category | null>;
  listForUser(userId: string): Promise<Category[]>;
}
