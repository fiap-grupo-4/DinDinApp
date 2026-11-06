import {
  SavingsGoal,
  CreateSavingsGoalDTO,
  UpdateSavingsGoalDTO,
} from "../entities/SavingsGoal";

export interface ISavingsGoalRepository {
  create(data: CreateSavingsGoalDTO): Promise<SavingsGoal>;
  update(id: string, data: UpdateSavingsGoalDTO): Promise<void>;
  getById(id: string): Promise<SavingsGoal | null>;
  delete(id: string): Promise<void>;
  listForUser(userId: string): Promise<SavingsGoal[]>;
}
