import { NotFoundError } from "@domain/shared/errors";
import { ICategoryRepository } from "@domain/categories/repositories/ICategoryRepository";
import {
  Category,
  CreateCategoryDTO,
} from "@domain/categories/entities/Category";
import { requireText, requireUserId } from "../validation/validation";

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
  const name = requireText(
    data.name,
    1,
    60,
    "O nome da categoria deve ter entre 1 e 60 caracteres.",
  );
  return repository.create({ ...data, name });
}
