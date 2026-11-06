import { DomainError } from "@domain/shared/errors";

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "E-mail inválido.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/user-not-found": "E-mail ou senha inválidos.",
  "auth/wrong-password": "E-mail ou senha inválidos.",
  "auth/invalid-credential": "E-mail ou senha inválidos.",
  "auth/email-already-in-use": "Não foi possível criar a conta com esses dados.",
  "auth/weak-password": "A senha não atende aos requisitos de segurança.",
  "auth/password-does-not-meet-requirements":
    "A senha não atende aos requisitos de segurança.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
  "permission-denied": "Não foi possível concluir a operação.",
};

export function getSafeErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof DomainError) return error.message;
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code: unknown }).code);
    return FIREBASE_ERROR_MESSAGES[code] ?? fallback;
  }
  return fallback;
}

export function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}
