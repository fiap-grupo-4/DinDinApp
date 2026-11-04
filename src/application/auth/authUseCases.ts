import {
  IAuthRepository,
  AuthUser,
} from "@domain/auth/repositories/IAuthRepository";
import { CreateUserRequest, User } from "@domain/auth/entities/User";
import { ValidationError } from "@domain/shared/errors";

export async function signIn(
  repository: IAuthRepository,
  email: string,
  password: string,
): Promise<AuthUser> {
  const trimmedEmail = email.trim();
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
  return repository.register(data);
}

export async function forgotPassword(
  repository: IAuthRepository,
  email: string,
): Promise<void> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) throw new ValidationError("Informe o e-mail.");
  return repository.forgotPassword(trimmedEmail);
}

export async function getProfile(
  repository: IAuthRepository,
  uid: string,
): Promise<User | null> {
  return repository.getProfile(uid);
}
