import { toast } from "@/src/lib/sonner";
import { CreateUserRequest } from "@domain/auth/entities/User";
import {
  forgotPassword,
  register,
  signIn,
  signOut,
} from "@domain/auth/use-cases/authUseCases";
import { useAuthRepository } from "@features/auth/providers/AuthRepositoryProvider";
import { useRouter } from "expo-router";
import { useState } from "react";

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

function getAuthErrorMessage(
  error: unknown,
  fallback: string,
  overrides?: Record<string, string>,
) {
  const code = getErrorCode(error);

  if (!code) return fallback;

  return (
    overrides?.[code] ??
    overrides?.[`auth/${code}`] ??
    AUTH_ERROR_MESSAGES[code] ??
    AUTH_ERROR_MESSAGES[`auth/${code}`] ??
    `${fallback} (${code})`
  );
}

export function useAuth() {
  const repository = useAuthRepository();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (email: string, password: string) => {
    if (isPending) return;

    setIsPending(true);
    setError(null);

    try {
      await signIn(repository, email, password);
      toast.success("Login realizado com sucesso.");
    } catch (err) {
      const message = getAuthErrorMessage(err, "Erro ao fazer login.");
      setError(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  const handleSignOut = async () => {
    if (isPending) return;

    setIsPending(true);
    setError(null);

    try {
      await signOut(repository);
      toast.success("Você saiu da conta.");
    } catch (err) {
      const message = getAuthErrorMessage(err, "Erro ao sair.");
      setError(message);
      toast.error(message);
      setIsPending(false);
    }
  };

  const handleRegister = async (data: CreateUserRequest) => {
    if (isPending) return;

    setIsPending(true);
    setError(null);

    try {
      await register(repository, data);
      toast.success("Conta criada com sucesso.");
    } catch (err) {
      console.error("Falha no cadastro:", err);
      const message = getAuthErrorMessage(err, "Erro ao criar conta.");
      setError(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    if (isPending) return;

    setIsPending(true);
    setError(null);

    try {
      await forgotPassword(repository, email);
      toast.success("Enviamos um e-mail para redefinir sua senha.");
      /* router.replace("/auth/login"); */
    } catch (err) {
      const message = getAuthErrorMessage(
        err,
        "Erro ao enviar e-mail de recuperação.",
        {
          "auth/user-not-found":
            "Não encontramos uma conta com este e-mail.",
        },
      );
      setError(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    error,
    handleSignIn,
    handleRegister,
    handleSignOut,
    handleForgotPassword,
  };
}
