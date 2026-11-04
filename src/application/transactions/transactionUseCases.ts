import { ICategoryRepository } from "@domain/categories/repositories/ICategoryRepository";
import { ValidationError, NotFoundError } from "@domain/shared/errors";
import {
  CreateTransactionDTO,
  TRANSACTION_TYPES,
  Transaction,
  TransactionType,
  UpdateTransactionDTO,
} from "@domain/transactions/entities/Transaction";
import {
  ITransactionRepository,
  PaginatedResult,
  TransactionFilters,
} from "@domain/transactions/repositories/ITransactionRepository";
import { requirePositiveInteger, requireUserId } from "../validation/validation";

export type TransactionUseCaseDeps = {
  transactions: ITransactionRepository;
  categories: ICategoryRepository;
};

function validateValue(value: number): void {
  if (!Number.isSafeInteger(value)) {
    throw new ValidationError("Informe um valor válido.");
  }
  requirePositiveInteger(value, "O valor deve ser maior que zero.");
}

function validateType(type: TransactionType): void {
  if (!TRANSACTION_TYPES.includes(type)) {
    throw new ValidationError("Tipo de transação inválido.");
  }
}

function normalizeDescription(description?: string): string | undefined {
  const trimmed = description?.trim();
  return trimmed ? trimmed : undefined;
}

async function validateCategory(
  categories: ICategoryRepository,
  userId: string,
  categoryId: string,
): Promise<void> {
  const category = await categories.getById(categoryId);
  if (!category || category.userId !== userId) {
    throw new ValidationError("Categoria inválida.");
  }
}

async function loadOwned(
  deps: Pick<TransactionUseCaseDeps, "transactions">,
  userId: string,
  transactionId: string,
): Promise<Transaction> {
  requireUserId(userId);
  const transaction = await deps.transactions.getById(transactionId);
  if (!transaction || transaction.userId !== userId) {
    throw new NotFoundError("Transação não encontrada.");
  }
  return transaction;
}

export async function listTransactions(
  deps: Pick<TransactionUseCaseDeps, "transactions">,
  userId: string,
  filters?: TransactionFilters,
): Promise<PaginatedResult<Transaction>> {
  requireUserId(userId);
  if (
    filters?.limit !== undefined &&
    (!Number.isInteger(filters.limit) || filters.limit <= 0)
  ) {
    throw new ValidationError("O limite deve ser um inteiro maior que zero.");
  }
  return deps.transactions.listForUser(userId, filters);
}

export async function getTransaction(
  deps: Pick<TransactionUseCaseDeps, "transactions">,
  userId: string,
  transactionId: string,
): Promise<Transaction> {
  return loadOwned(deps, userId, transactionId);
}

export async function createTransaction(
  deps: TransactionUseCaseDeps,
  data: CreateTransactionDTO,
): Promise<Transaction> {
  requireUserId(data.userId);
  validateValue(data.valueInCents);
  validateType(data.transactionType);

  const categoryId = data.categoryId?.trim() || undefined;
  if (categoryId) {
    await validateCategory(deps.categories, data.userId, categoryId);
  }

  const { description, categoryId: _category, ...rest } = data;
  const normalizedDescription = normalizeDescription(description);

  return deps.transactions.create({
    ...rest,
    ...(normalizedDescription !== undefined && {
      description: normalizedDescription,
    }),
    ...(categoryId !== undefined && { categoryId }),
  });
}

export async function updateTransaction(
  deps: TransactionUseCaseDeps,
  userId: string,
  transactionId: string,
  data: UpdateTransactionDTO,
): Promise<UpdateTransactionDTO> {
  await loadOwned(deps, userId, transactionId);

  // Protege contra userId vindo em runtime.
  const { userId: _ignored, ...fields } = data as UpdateTransactionDTO & {
    userId?: string;
  };
  const normalized: UpdateTransactionDTO = { ...fields };

  if ("valueInCents" in fields) {
    validateValue(fields.valueInCents as number);
  }
  if ("transactionType" in fields) {
    validateType(fields.transactionType as TransactionType);
  }
  if ("description" in fields) {
    normalized.description = normalizeDescription(fields.description);
  }
  if ("categoryId" in fields) {
    const categoryId = fields.categoryId?.trim() || undefined;
    normalized.categoryId = categoryId;
    if (categoryId) {
      await validateCategory(deps.categories, userId, categoryId);
    }
  }

  await deps.transactions.update(transactionId, normalized);
  return normalized;
}

export async function deleteTransaction(
  deps: Pick<TransactionUseCaseDeps, "transactions">,
  userId: string,
  transactionId: string,
): Promise<void> {
  await loadOwned(deps, userId, transactionId);
  await deps.transactions.delete(transactionId);
}
