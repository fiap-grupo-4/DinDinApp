import { ValidationError } from "@domain/shared/errors";

export const MAX_VALUE_IN_CENTS = 1_000_000_000_000;

export function requireUserId(userId: string): void {
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new ValidationError("Usuário não identificado.");
  }
}

export function requirePositiveInteger(value: number, message: string): void {
  if (
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    value > MAX_VALUE_IN_CENTS
  ) {
    throw new ValidationError(message);
  }
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[\p{Cc}\u200b\u2060\ufeff]/gu, " ")
    .replace(/[\u200e\u200f\u202a-\u202e]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function requireText(
  value: string,
  min: number,
  max: number,
  message: string,
): string {
  const normalized = normalizeText(value);
  if (normalized.length < min || normalized.length > max) {
    throw new ValidationError(message);
  }
  return normalized;
}
