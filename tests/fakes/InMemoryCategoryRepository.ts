import {
  Category,
  CreateCategoryDTO,
} from "@domain/categories/entities/Category";
import { ICategoryRepository } from "@domain/categories/repositories/ICategoryRepository";

export class InMemoryCategoryRepository implements ICategoryRepository {
  items = new Map<string, Category>();
  calls = {
    create: [] as CreateCategoryDTO[],
    getById: [] as string[],
    listForUser: [] as string[],
  };
  private counter = 0;

  seed(...categories: Category[]): void {
    for (const category of categories) {
      this.items.set(category.uid, category);
    }
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    this.calls.create.push(data);
    this.counter += 1;
    const category: Category = {
      ...data,
      uid: `cat-${this.counter}`,
      createdAt: new Date(2026, 5, 15, 12).toISOString(),
    };
    this.items.set(category.uid, category);
    return category;
  }

  async getById(id: string): Promise<Category | null> {
    this.calls.getById.push(id);
    return this.items.get(id) ?? null;
  }

  async listForUser(userId: string): Promise<Category[]> {
    this.calls.listForUser.push(userId);
    return [...this.items.values()].filter((item) => item.userId === userId);
  }
}
