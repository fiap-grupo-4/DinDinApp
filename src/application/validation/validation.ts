import { ValidationError } from "@domain/shared/errors";

export function requireUserId(userId: string): void {
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new ValidationError("Usuário não identificado.");
  }
}

export function requirePositiveInteger(value: number, message: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new ValidationError(message);
  }
}
