import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import {
  IAuthRepository,
  AuthUser,
  AuthState,
} from "@domain/auth/repositories/IAuthRepository";
import { CreateUserRequest } from "@domain/auth/entities/User";

export class FirebaseAuthRepository implements IAuthRepository {
  async signIn(email: string, password: string): Promise<AuthUser> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email ?? "",
    };
  }

  async signOut(): Promise<void> {
    await signOut(auth);
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
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Falha ao salvar usuário no Firestore:", err);
    }

    return { uid: user.uid, email: data.email };
  }

  onAuthStateChanged(callback: (user: AuthState) => void): () => void {
    return onAuthStateChanged(auth, (user: User | null) => {
      callback(
        user != null
          ? {
              user: { uid: user.uid, email: user.email ?? undefined },
              loading: false,
            }
          : { user: null, loading: false },
      );
    });
  }
}
