import {
  IAuthRepository,
  AuthUser,
  AuthState,
} from "@domain/auth/repositories/IAuthRepository";
import { CreateUserRequest } from "@domain/auth/entities/User";

export async function signIn(
  repository: IAuthRepository,
  email: string,
  password: string,
): Promise<AuthUser> {
  return repository.signIn(email, password);
}

export async function signOut(repository: IAuthRepository): Promise<void> {
  return repository.signOut();
}

export async function register(
  repository: IAuthRepository,
  data: CreateUserRequest,
): Promise<AuthUser> {
  return repository.register(data);
}
