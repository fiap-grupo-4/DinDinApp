import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { AuthState } from "@domain/auth/repositories/IAuthRepository";
import { useRepositories } from "@presentation/providers/RepositoriesContext";

type AuthContextValue = AuthState & {
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { auth: repository } = useRepositories();
  const [state, setState] = useState<AuthState>({ user: null, loading: true });
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsub = repository.onAuthStateChanged((nextState: AuthState) =>
      setState(nextState),
    );
    return () => unsub();
  }, [repository]);

  const refreshUser = async () => {
    const user = await repository.reloadCurrentUser();
    setState({ user, loading: false });
  };

  useEffect(() => {
    if (state.loading) return;

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === "auth";
    const inProtectedGroup =
      rootSegment === "(app)" ||
      rootSegment === "dashboard" ||
      rootSegment === "transactions" ||
      rootSegment === "account" ||
      rootSegment === "profile";

    if (!state.user && inProtectedGroup) {
      router.replace("/auth/login");
      return;
    }

    if (!state.user && inAuthGroup && (segments as string[])[1] === "verify-email") {
      router.replace("/auth/login");
      return;
    }

    if (state.user && !state.user.emailVerified) {
      if ((segments as string[])[1] !== "verify-email") {
        router.replace("/auth/verify-email");
      }
      return;
    }

    if (state.user?.emailVerified && inAuthGroup) {
      router.replace("/dashboard");
    }
  }, [state.loading, state.user, segments, router]);

  return (
    <AuthContext.Provider value={{ ...state, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthState() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthState must be used within AuthProvider");
  return ctx;
}
