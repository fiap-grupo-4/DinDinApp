import { CreateUserRequest, User } from "@domain/auth/entities/User";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  hasTotp: boolean;
}

export interface TotpEnrollment {
  secretKey: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

export interface IAuthRepository {
  signIn(email: string, password: string): Promise<AuthUser>;
  resolveTotpSignIn(code: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  register(data: CreateUserRequest): Promise<AuthUser>;
  forgotPassword(email: string): Promise<void>;
  sendVerificationEmail(): Promise<void>;
  reloadCurrentUser(): Promise<AuthUser | null>;
  startTotpEnrollment(): Promise<TotpEnrollment>;
  finishTotpEnrollment(code: string): Promise<void>;
  disableTotp(password: string, code: string): Promise<void>;
  getProfile(uid: string): Promise<User | null>;
  onAuthStateChanged(callback: (state: AuthState) => void): () => void;
}
