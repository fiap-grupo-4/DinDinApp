import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuthState } from "@/src/features/auth/providers/AuthProvider";

export function useRequireAuth() {
  const { user, loading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);
}
