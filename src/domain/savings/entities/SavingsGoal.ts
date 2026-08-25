export interface SavingsGoal {
  uid: string;
  userId: string;
  title: string;
  currentValueInCents: number;
  targetValueInCents: number;
  createdAt: string;
}

export type CreateSavingsGoalDTO = Omit<SavingsGoal, "uid" | "createdAt">;

export type UpdateSavingsGoalDTO = Partial<CreateSavingsGoalDTO>;
