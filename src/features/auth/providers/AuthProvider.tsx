import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSegments } from "expo-router";
import { FirebaseAuthRepository } from "../infra/FirebaseAuthRepository";
import { AuthState } from "@/src/domain/auth/repositories/IAuthRepository";

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const repository = useMemo(() => new FirebaseAuthRepository(), []);

  const [state, setState] = useState<AuthState>({ user: null, loading: true });
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsub = repository.onAuthStateChanged((user: AuthState) =>
      setState(user),
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!state.loading && !state.user) {
      const path = "/" + segments.join("/");
      if (
        path.startsWith("/dashboard") ||
        path.startsWith("/transactions") ||
        path === "/profile"
      ) {
        router.replace("/auth/login");
      }
    }
  }, [state.loading, state.user, router]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export function useAuthState() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthState must be used within AuthProvider");
  return ctx;
}
