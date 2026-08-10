import { useState } from "react";
import { useAuthRepository } from "@features/auth/providers/AuthRepositoryProvider";
import { signIn, register } from "@domain/auth/use-cases/authUseCases";
import { CreateUserRequest } from "@domain/auth/entities/User";
import { useRouter } from "expo-router";

export function useAuth() {
  const repository = useAuthRepository();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      return await signIn(repository, email, password);
    } catch (err) {
      setError((err as Error).message || "Erro ao fazer login.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await repository.signOut();
      router.replace("/auth/login");
    } catch (err) {
      setError((err as Error).message || "Erro ao sair.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: CreateUserRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await register(repository, data);
    } catch (err) {
      setError((err as Error).message || "Erro ao criar conta.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleSignIn, handleRegister, handleSignOut };
}
