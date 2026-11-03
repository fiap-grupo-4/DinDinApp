import { ICategoryRepository } from "@domain/categories/repositories/ICategoryRepository";
import {
  Category,
  CreateCategoryDTO,
} from "@domain/categories/entities/Category";

export async function listCategories(
  repository: ICategoryRepository,
  userId: string,
): Promise<Category[]> {
  return repository.listForUser(userId);
}

export async function getCategory(
  repository: ICategoryRepository,
  categoryId: string,
): Promise<Category | null> {
  return repository.getById(categoryId);
}

export async function createCategory(
  repository: ICategoryRepository,
  data: CreateCategoryDTO,
): Promise<Category> {
  return repository.create(data);
}
