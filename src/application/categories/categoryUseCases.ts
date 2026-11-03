import { NotFoundError, ValidationError } from "@domain/shared/errors";
import { ICategoryRepository } from "@domain/categories/repositories/ICategoryRepository";
import {
  Category,
  CreateCategoryDTO,
} from "@domain/categories/entities/Category";
import { requireUserId } from "../validation/validation";

export async function listCategories(
  repository: ICategoryRepository,
  userId: string,
): Promise<Category[]> {
  requireUserId(userId);
  return repository.listForUser(userId);
}

export async function getCategory(
  repository: ICategoryRepository,
  userId: string,
  categoryId: string,
): Promise<Category> {
  requireUserId(userId);
  const category = await repository.getById(categoryId);
  if (!category || category.userId !== userId) {
    throw new NotFoundError("Categoria não encontrada.");
  }
  return category;
}

export async function createCategory(
  repository: ICategoryRepository,
  data: CreateCategoryDTO,
): Promise<Category> {
  requireUserId(data.userId);
  const name = data.name.trim();
  if (!name) throw new ValidationError("Informe o nome da categoria.");
  return repository.create({ ...data, name });
}
