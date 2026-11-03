import { CreateUserRequest, User } from "@domain/auth/entities/User";
import {
  AuthState,
  AuthUser,
  IAuthRepository,
} from "@domain/auth/repositories/IAuthRepository";

export class FakeAuthRepository implements IAuthRepository {
  profiles = new Map<string, User>();
  calls = {
    signIn: [] as { email: string; password: string }[],
    signOut: 0,
    register: [] as CreateUserRequest[],
    forgotPassword: [] as string[],
    getProfile: [] as string[],
  };

  seed(...users: User[]): void {
    for (const user of users) {
      this.profiles.set(user.uid, user);
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    this.calls.signIn.push({ email, password });
    return { uid: "user-1", email, displayName: null };
  }

  async signOut(): Promise<void> {
    this.calls.signOut += 1;
  }

  async register(data: CreateUserRequest): Promise<AuthUser> {
    this.calls.register.push(data);
    return { uid: "user-1", email: data.email, displayName: data.fullName };
  }

  async forgotPassword(email: string): Promise<void> {
    this.calls.forgotPassword.push(email);
  }

  async getProfile(uid: string): Promise<User | null> {
    this.calls.getProfile.push(uid);
    return this.profiles.get(uid) ?? null;
  }

  onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    callback({ user: null, loading: false });
    return () => {};
  }
}
