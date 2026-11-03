import {
  IAuthRepository,
  AuthUser,
} from "@domain/auth/repositories/IAuthRepository";
import { CreateUserRequest, User } from "@domain/auth/entities/User";

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

export async function forgotPassword(
  repository: IAuthRepository,
  email: string,
): Promise<void> {
  return repository.forgotPassword(email);
}

export async function getProfile(
  repository: IAuthRepository,
  uid: string,
): Promise<User | null> {
  return repository.getProfile(uid);
}
