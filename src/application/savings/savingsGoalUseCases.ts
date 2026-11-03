import { ISavingsGoalRepository } from "@domain/savings/repositories/ISavingsGoalRepository";
import {
  SavingsGoal,
  CreateSavingsGoalDTO,
  UpdateSavingsGoalDTO,
} from "@domain/savings/entities/SavingsGoal";

export async function listSavingsGoals(
  repository: ISavingsGoalRepository,
  userId: string,
): Promise<SavingsGoal[]> {
  return repository.listForUser(userId);
}

export async function createSavingsGoal(
  repository: ISavingsGoalRepository,
  data: CreateSavingsGoalDTO,
): Promise<SavingsGoal> {
  return repository.create(data);
}

export async function updateSavingsGoal(
  repository: ISavingsGoalRepository,
  savingsGoalId: string,
  data: UpdateSavingsGoalDTO,
): Promise<void> {
  return repository.update(savingsGoalId, data);
}

export async function deleteSavingsGoal(
  repository: ISavingsGoalRepository,
  savingsGoalId: string,
): Promise<void> {
  return repository.delete(savingsGoalId);
}
