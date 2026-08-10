import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuthState } from "@/src/features/auth/providers/AuthProvider";

export default function Index() {
  const { user, loading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/dashboard");
    else router.replace("/auth/login");
  }, [user, loading, router]);

  return null;
}
