import { CreateUserRequest, User } from "@domain/auth/entities/User";
import {
  AuthState,
  AuthUser,
  IAuthRepository,
  TotpEnrollment,
} from "@domain/auth/repositories/IAuthRepository";

export class FakeAuthRepository implements IAuthRepository {
  profiles = new Map<string, User>();
  calls = {
    signIn: [] as { email: string; password: string }[],
    signOut: 0,
    register: [] as CreateUserRequest[],
    forgotPassword: [] as string[],
    getProfile: [] as string[],
    resolveTotpSignIn: [] as string[],
    sendVerificationEmail: 0,
    reloadCurrentUser: 0,
    startTotpEnrollment: 0,
    finishTotpEnrollment: [] as string[],
    disableTotp: [] as { password: string; code: string }[],
  };

  seed(...users: User[]): void {
    for (const user of users) {
      this.profiles.set(user.uid, user);
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    this.calls.signIn.push({ email, password });
    return {
      uid: "user-1",
      email,
      displayName: null,
      emailVerified: true,
      hasTotp: false,
    };
  }

  async resolveTotpSignIn(code: string): Promise<AuthUser> {
    this.calls.resolveTotpSignIn.push(code);
    return {
      uid: "user-1",
      email: "user@example.com",
      displayName: null,
      emailVerified: true,
      hasTotp: true,
    };
  }

  async signOut(): Promise<void> {
    this.calls.signOut += 1;
  }

  async register(data: CreateUserRequest): Promise<AuthUser> {
    this.calls.register.push(data);
    return {
      uid: "user-1",
      email: data.email,
      displayName: data.fullName,
      emailVerified: false,
      hasTotp: false,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    this.calls.forgotPassword.push(email);
  }

  async sendVerificationEmail(): Promise<void> {
    this.calls.sendVerificationEmail += 1;
  }

  async reloadCurrentUser(): Promise<AuthUser | null> {
    this.calls.reloadCurrentUser += 1;
    return null;
  }

  async startTotpEnrollment(): Promise<TotpEnrollment> {
    this.calls.startTotpEnrollment += 1;
    return { secretKey: "TESTSECRET" };
  }

  async finishTotpEnrollment(code: string): Promise<void> {
    this.calls.finishTotpEnrollment.push(code);
  }

  async disableTotp(password: string, code: string): Promise<void> {
    this.calls.disableTotp.push({ password, code });
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
