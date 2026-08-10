import { CreateUserRequest } from "@domain/auth/entities/User";

export interface AuthUser {
  uid: string;
  email: string;
}

export interface AuthState {
  user: { uid: string; email?: string } | null;
  loading: boolean;
}

export interface IAuthRepository {
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  register(data: CreateUserRequest): Promise<AuthUser>;
  onAuthStateChanged(callback: (state: AuthState) => void): () => void;
}
