import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  getIdToken,
  getMultiFactorResolver,
  multiFactor,
  TotpMultiFactorGenerator,
  type MultiFactorError,
  type MultiFactorResolver,
  type TotpSecret,
  signOut as firebaseSignOut,
  onIdTokenChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@infra/firebase";
import {
  IAuthRepository,
  AuthUser,
  AuthState,
} from "@domain/auth/repositories/IAuthRepository";
import { CreateUserRequest, User } from "@domain/auth/entities/User";
import { TotpChallengeRequiredError } from "@domain/auth/errors";
import type { TotpEnrollment } from "@domain/auth/repositories/IAuthRepository";
import { logger } from "../../logging/logger";

function mapAuthUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? null,
    emailVerified: user.emailVerified,
    hasTotp: multiFactor(user).enrolledFactors.some(
      (factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID,
    ),
  };
}

function toIsoDate(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
  }

  return "";
}

function mapProfile(uid: string, data: Record<string, unknown>): User {
  return {
    uid,
    email: typeof data.email === "string" ? data.email : "",
    fullName: typeof data.fullName === "string" ? data.fullName : "",
    birthday: typeof data.birthday === "string" ? data.birthday : "",
    createdAt: toIsoDate(data.createdAt),
  };
}

export class FirebaseAuthRepository implements IAuthRepository {
  private totpResolver: MultiFactorResolver | null = null;
  private totpSecret: TotpSecret | null = null;

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      this.totpResolver = null;
      return mapAuthUser(userCredential.user);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "auth/multi-factor-auth-required"
      ) {
        const resolver = getMultiFactorResolver(auth, error as MultiFactorError);
        if (
          resolver.hints.some(
            (hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID,
          )
        ) {
          this.totpResolver = resolver;
          throw new TotpChallengeRequiredError();
        }
      }
      throw error;
    }
  }

  async resolveTotpSignIn(code: string): Promise<AuthUser> {
    if (!this.totpResolver || !/^\d{6}$/.test(code)) {
      throw new Error("Código de verificação inválido.");
    }
    const hint = this.totpResolver.hints.find(
      (factor) => factor.factorId === TotpMultiFactorGenerator.FACTOR_ID,
    );
    if (!hint) throw new Error("Fator TOTP não disponível.");

    const assertion = TotpMultiFactorGenerator.assertionForSignIn(
      hint.uid,
      code,
    );
    const credential = await this.totpResolver.resolveSignIn(assertion);
    this.totpResolver = null;
    return mapAuthUser(credential.user);
  }

  async signOut(): Promise<void> {
    this.totpResolver = null;
    this.totpSecret = null;
    await firebaseSignOut(auth);
  }

  async register(data: CreateUserRequest): Promise<AuthUser> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );
    const user = userCredential.user;

    try {
      await updateProfile(user, { displayName: data.fullName });
      await sendEmailVerification(user);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: data.email,
        fullName: data.fullName,
        birthday: data.birthday,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      await deleteUser(user).catch((rollbackError) => {
        logger.error("auth.registration_rollback_failed", rollbackError);
      });
      throw error;
    }

    return mapAuthUser(user);
  }

  async forgotPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  async sendVerificationEmail(): Promise<void> {
    if (!auth.currentUser) throw new Error("Sessão não encontrada.");
    await sendEmailVerification(auth.currentUser);
  }

  async reloadCurrentUser(): Promise<AuthUser | null> {
    if (!auth.currentUser) return null;
    await reload(auth.currentUser);
    await getIdToken(auth.currentUser, true);
    return mapAuthUser(auth.currentUser);
  }

  async startTotpEnrollment(): Promise<TotpEnrollment> {
    const user = auth.currentUser;
    if (!user?.emailVerified) {
      throw new Error("Verifique seu e-mail antes de ativar o MFA.");
    }
    const session = await multiFactor(user).getSession();
    const secret = await TotpMultiFactorGenerator.generateSecret(session);
    this.totpSecret = secret;
    return { secretKey: secret.secretKey };
  }

  async finishTotpEnrollment(code: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !this.totpSecret || !/^\d{6}$/.test(code)) {
      throw new Error("Código de verificação inválido.");
    }
    const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
      this.totpSecret,
      code,
    );
    await multiFactor(user).enroll(assertion, "DinDinApp");
    this.totpSecret = null;
  }

  async disableTotp(password: string, code: string): Promise<void> {
    const user = auth.currentUser;
    const factor = user
      ? multiFactor(user).enrolledFactors.find(
          (item) => item.factorId === TotpMultiFactorGenerator.FACTOR_ID,
        )
      : undefined;
    if (!user?.email || !factor || !/^\d{6}$/.test(code)) {
      throw new Error("Não foi possível validar a autenticação TOTP.");
    }

    try {
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, password),
      );
    } catch (error) {
      if (
        typeof error !== "object" ||
        error === null ||
        !("code" in error) ||
        (error as { code?: string }).code !==
          "auth/multi-factor-auth-required"
      ) {
        throw error;
      }

      const resolver = getMultiFactorResolver(auth, error as MultiFactorError);
      const hint = resolver.hints.find(
        (item) => item.factorId === TotpMultiFactorGenerator.FACTOR_ID,
      );
      if (!hint) throw error;
      await resolver.resolveSignIn(
        TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code),
      );
    }

    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== user.uid) {
      throw new Error("A sessão da conta mudou durante a operação.");
    }
    await multiFactor(currentUser).unenroll(factor.uid);
  }

  async getProfile(uid: string): Promise<User | null> {
    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) return null;

    return mapProfile(snap.id, snap.data());
  }

  onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    return onIdTokenChanged(auth, (user: FirebaseUser | null) => {
      callback(
        user != null
          ? { user: mapAuthUser(user), loading: false }
          : { user: null, loading: false },
      );
    });
  }
}
