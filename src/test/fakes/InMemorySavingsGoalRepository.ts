import {
  CreateSavingsGoalDTO,
  SavingsGoal,
  UpdateSavingsGoalDTO,
} from "@domain/savings/entities/SavingsGoal";
import { ISavingsGoalRepository } from "@domain/savings/repositories/ISavingsGoalRepository";

export class InMemorySavingsGoalRepository implements ISavingsGoalRepository {
  items = new Map<string, SavingsGoal>();
  calls = {
    create: [] as CreateSavingsGoalDTO[],
    update: [] as { id: string; data: UpdateSavingsGoalDTO }[],
    delete: [] as string[],
    listForUser: [] as string[],
  };
  private counter = 0;

  seed(...goals: SavingsGoal[]): void {
    for (const goal of goals) {
      this.items.set(goal.uid, goal);
    }
  }

  get writeCount(): number {
    return (
      this.calls.create.length +
      this.calls.update.length +
      this.calls.delete.length
    );
  }

  async create(data: CreateSavingsGoalDTO): Promise<SavingsGoal> {
    this.calls.create.push(data);
    this.counter += 1;
    const goal: SavingsGoal = {
      ...data,
      uid: `goal-${this.counter}`,
      createdAt: new Date(2026, 5, 15, 12).toISOString(),
    };
    this.items.set(goal.uid, goal);
    return goal;
  }

  async update(id: string, data: UpdateSavingsGoalDTO): Promise<void> {
    this.calls.update.push({ id, data });
    const current = this.items.get(id);
    if (current) this.items.set(id, { ...current, ...data });
  }

  async getById(id: string): Promise<SavingsGoal | null> {
    return this.items.get(id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.calls.delete.push(id);
    this.items.delete(id);
  }

  async listForUser(userId: string): Promise<SavingsGoal[]> {
    this.calls.listForUser.push(userId);
    return [...this.items.values()].filter((item) => item.userId === userId);
  }
}
