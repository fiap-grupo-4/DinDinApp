import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import {
  IAuthRepository,
  AuthUser,
  AuthState,
} from "@domain/auth/repositories/IAuthRepository";
import { CreateUserRequest, User } from "@domain/auth/entities/User";

function mapAuthUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? null,
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
  async signIn(email: string, password: string): Promise<AuthUser> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return mapAuthUser(userCredential.user);
  }

  async signOut(): Promise<void> {
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
    } catch (err) {
      console.error("Falha ao atualizar o perfil no Auth:", err);
    }

    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: data.email,
        fullName: data.fullName,
        birthday: data.birthday,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Falha ao salvar usuário no Firestore:", err);
    }

    return mapAuthUser(user);
  }

  async forgotPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  async getProfile(uid: string): Promise<User | null> {
    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) return null;

    return mapProfile(snap.id, snap.data());
  }

  onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    return onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      callback(
        user != null
          ? { user: mapAuthUser(user), loading: false }
          : { user: null, loading: false },
      );
    });
  }
}
