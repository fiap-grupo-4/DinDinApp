import { CreateUserRequest, User } from "@domain/auth/entities/User";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

export interface IAuthRepository {
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  register(data: CreateUserRequest): Promise<AuthUser>;
  forgotPassword(email: string): Promise<void>;
  getProfile(uid: string): Promise<User | null>;
  onAuthStateChanged(callback: (state: AuthState) => void): () => void;
}
