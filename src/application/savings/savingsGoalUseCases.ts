import {
  CreateSavingsGoalDTO,
  SavingsGoal,
  UpdateSavingsGoalDTO,
} from "@domain/savings/entities/SavingsGoal";
import { ISavingsGoalRepository } from "@domain/savings/repositories/ISavingsGoalRepository";
import { NotFoundError, ValidationError } from "@domain/shared/errors";
import { requirePositiveInteger, requireUserId } from "../validation/validation";

type GoalValues = Pick<
  SavingsGoal,
  "title" | "currentValueInCents" | "targetValueInCents"
>;

function validateGoal(values: GoalValues): void {
  if (values.title.trim().length < 3) {
    throw new ValidationError(
      'O campo "Título" deve ter no mínimo 3 caracteres.',
    );
  }
  requirePositiveInteger(
    values.targetValueInCents,
    "A meta deve ser um valor inteiro em centavos maior que zero.",
  );
  if (
    !Number.isSafeInteger(values.currentValueInCents) ||
    values.currentValueInCents < 0
  ) {
    throw new ValidationError(
      "O valor atual deve ser um valor inteiro em centavos, maior ou igual a zero.",
    );
  }
  if (values.currentValueInCents > values.targetValueInCents) {
    throw new ValidationError("O valor atual não pode ser maior que a meta.");
  }
}

async function loadOwned(
  repository: ISavingsGoalRepository,
  userId: string,
  savingsGoalId: string,
): Promise<SavingsGoal> {
  requireUserId(userId);
  const goal = await repository.getById(savingsGoalId);
  if (!goal || goal.userId !== userId) {
    throw new NotFoundError("Meta não encontrada.");
  }
  return goal;
}

export async function listSavingsGoals(
  repository: ISavingsGoalRepository,
  userId: string,
): Promise<SavingsGoal[]> {
  requireUserId(userId);
  return repository.listForUser(userId);
}

export async function createSavingsGoal(
  repository: ISavingsGoalRepository,
  data: CreateSavingsGoalDTO,
): Promise<SavingsGoal> {
  requireUserId(data.userId);
  validateGoal(data);
  return repository.create({ ...data, title: data.title.trim() });
}

export async function updateSavingsGoal(
  repository: ISavingsGoalRepository,
  userId: string,
  savingsGoalId: string,
  data: UpdateSavingsGoalDTO,
): Promise<UpdateSavingsGoalDTO> {
  const current = await loadOwned(repository, userId, savingsGoalId);

  // Protege contra userId vindo em runtime.
  const { userId: _ignored, ...fields } = data as UpdateSavingsGoalDTO & {
    userId?: string;
  };
  const normalized: UpdateSavingsGoalDTO = { ...fields };
  if ("title" in fields) normalized.title = fields.title?.trim() ?? "";

  validateGoal({
    title: current.title,
    currentValueInCents: current.currentValueInCents,
    targetValueInCents: current.targetValueInCents,
    ...normalized,
  });

  await repository.update(savingsGoalId, normalized);
  return normalized;
}

export async function deleteSavingsGoal(
  repository: ISavingsGoalRepository,
  userId: string,
  savingsGoalId: string,
): Promise<void> {
  await loadOwned(repository, userId, savingsGoalId);
  await repository.delete(savingsGoalId);
}
