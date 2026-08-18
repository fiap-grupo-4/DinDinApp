import { toast } from "@/src/lib/sonner";
import { CreateUserRequest } from "@domain/auth/entities/User";
import { register, signIn } from "@domain/auth/use-cases/authUseCases";
import { useAuthRepository } from "@features/auth/providers/AuthRepositoryProvider";
import { useRouter } from "expo-router";
import { useState, useTransition } from "react";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "E-mail inválido.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/user-not-found": "E-mail ou senha inválidos.",
  "auth/wrong-password": "E-mail ou senha inválidos.",
  "auth/invalid-credential": "E-mail ou senha inválidos.",
  "auth/email-already-in-use": "Este e-mail já está em uso.",
  "auth/weak-password":
    "A senha deve ter no mínimo 6 caracteres, com letra maiúscula, minúscula e caractere especial.",
  "auth/password-does-not-meet-requirements":
    "A senha deve ter letra minúscula, maiúscula e um caractere especial.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
  "auth/operation-not-allowed":
    "Login com e-mail e senha não está habilitado.",
  "permission-denied":
    "Sem permissão para salvar os dados. Verifique as regras do Firestore.",
};

function getErrorCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code: unknown }).code).trim();
    if (code) return code;
  }

  if (error instanceof Error) {
    const match = error.message.match(/\((auth\/[a-z0-9-]+)\)/i);
    if (match?.[1]) return match[1];
  }

  return null;
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  const code = getErrorCode(error);

  if (!code) return fallback;

  return (
    AUTH_ERROR_MESSAGES[code] ??
    AUTH_ERROR_MESSAGES[`auth/${code}`] ??
    `${fallback} (${code})`
  );
}

export function useAuth() {
  const repository = useAuthRepository();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = (email: string, password: string) => {
    startTransition(async () => {
      setError(null);

      try {
        await signIn(repository, email, password);
        toast.success("Login realizado com sucesso.");
      } catch (err) {
        const message = getAuthErrorMessage(err, "Erro ao fazer login.");
        setError(message);
        toast.error(message);
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      setError(null);

      try {
        await repository.signOut();
        toast.success("Você saiu da conta.");
        router.replace("/auth/login");
      } catch (err) {
        const message = getAuthErrorMessage(err, "Erro ao sair.");
        setError(message);
        toast.error(message);
      }
    });
  };

  const handleRegister = (data: CreateUserRequest) => {
    startTransition(async () => {
      setError(null);

      try {
        await register(repository, data);
        toast.success("Conta criada com sucesso.");
      } catch (err) {
        console.error("Falha no cadastro:", err);
        const message = getAuthErrorMessage(err, "Erro ao criar conta.");
        setError(message);
        toast.error(message);
      }
    });
  };

  return { isPending, error, handleSignIn, handleRegister, handleSignOut };
}
