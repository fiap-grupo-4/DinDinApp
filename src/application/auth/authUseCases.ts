import {
  IAuthRepository,
  AuthUser,
} from "@domain/auth/repositories/IAuthRepository";
import { CreateUserRequest, User } from "@domain/auth/entities/User";
import { ValidationError } from "@domain/shared/errors";
import { normalizeText, requireText } from "../validation/validation";
import type { TotpEnrollment } from "@domain/auth/repositories/IAuthRepository";

export async function signIn(
  repository: IAuthRepository,
  email: string,
  password: string,
): Promise<AuthUser> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    throw new ValidationError("Informe e-mail e senha.");
  }
  return repository.signIn(trimmedEmail, password);
}

export async function signOut(repository: IAuthRepository): Promise<void> {
  return repository.signOut();
}

export async function register(
  repository: IAuthRepository,
  data: CreateUserRequest,
): Promise<AuthUser> {
  if (
    data.confirmPassword !== undefined &&
    data.confirmPassword !== data.password
  ) {
    throw new ValidationError("As senhas não coincidem.");
  }
  const fullName = requireText(
    data.fullName,
    3,
    100,
    'O campo "Nome" deve ter entre 3 e 100 caracteres.',
  );
  const email = data.email.trim().toLowerCase();
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new ValidationError("Informe um e-mail válido.");
  }
  if (
    data.password.length < 8 ||
    data.password.length > 128 ||
    !/\d/.test(data.password) ||
    ["password123", "senha1234", "qwerty123", "12345678"].includes(
      data.password.toLowerCase(),
    )
  ) {
    throw new ValidationError(
      "A senha deve ter entre 8 e 128 caracteres, conter um número e não ser uma senha comum.",
    );
  }
  const birthday = data.birthday ? normalizeText(data.birthday) : "";
  const birthdayDate = birthday
    ? new Date(`${birthday}T00:00:00.000Z`)
    : null;
  if (
    birthday &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(birthday) ||
      Number.isNaN(birthdayDate?.getTime()) ||
      birthdayDate?.toISOString().slice(0, 10) !== birthday ||
      birthday < "1900-01-01" ||
      birthday > new Date().toISOString().slice(0, 10))
  ) {
    throw new ValidationError("Informe uma data de nascimento válida.");
  }
  return repository.register({ ...data, fullName, email, birthday });
}

export async function forgotPassword(
  repository: IAuthRepository,
  email: string,
): Promise<void> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) throw new ValidationError("Informe o e-mail.");
  return repository.forgotPassword(trimmedEmail);
}

export async function resolveTotpSignIn(
  repository: IAuthRepository,
  code: string,
): Promise<AuthUser> {
  if (!/^\d{6}$/.test(code)) {
    throw new ValidationError("Informe o código de seis dígitos.");
  }
  return repository.resolveTotpSignIn(code);
}

export async function sendVerificationEmail(
  repository: IAuthRepository,
): Promise<void> {
  return repository.sendVerificationEmail();
}

export async function reloadCurrentUser(
  repository: IAuthRepository,
): Promise<AuthUser | null> {
  return repository.reloadCurrentUser();
}

export async function startTotpEnrollment(
  repository: IAuthRepository,
): Promise<TotpEnrollment> {
  return repository.startTotpEnrollment();
}

export async function finishTotpEnrollment(
  repository: IAuthRepository,
  code: string,
): Promise<void> {
  if (!/^\d{6}$/.test(code)) {
    throw new ValidationError("Informe o código de seis dígitos.");
  }
  return repository.finishTotpEnrollment(code);
}

export async function disableTotp(
  repository: IAuthRepository,
  password: string,
  code: string,
): Promise<void> {
  if (!password || !/^\d{6}$/.test(code)) {
    throw new ValidationError("Informe sua senha e o código TOTP de seis dígitos.");
  }
  return repository.disableTotp(password, code);
}

export async function getProfile(
  repository: IAuthRepository,
  uid: string,
): Promise<User | null> {
  return repository.getProfile(uid);
}
