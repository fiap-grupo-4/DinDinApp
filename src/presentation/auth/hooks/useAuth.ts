import { toast } from "@/src/lib/sonner";
import { CreateUserRequest } from "@domain/auth/entities/User";
import { TotpChallengeRequiredError } from "@domain/auth/errors";
import { getErrorCode, getSafeErrorMessage } from "@lib/error-messages";
import { logger } from "@lib/logger";
import {
  forgotPassword,
  disableTotp,
  finishTotpEnrollment,
  register,
  resolveTotpSignIn,
  sendVerificationEmail,
  signIn,
  signOut,
  startTotpEnrollment,
} from "@application/auth/authUseCases";
import { useRepositories } from "@presentation/providers/RepositoriesContext";
import { useState } from "react";

export function useAuth() {
  const { auth: repository } = useRepositories();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    if (isPending) return;

    setIsPending(true);
    setError(null);
    setMfaRequired(false);

    try {
      await signIn(repository, email, password);
      toast.success("Login realizado com sucesso.");
    } catch (err) {
      if (err instanceof TotpChallengeRequiredError) {
        setMfaRequired(true);
        return;
      }
      logger.warn("auth.sign_in_failed", err);
      const message = getSafeErrorMessage(err, "Erro ao fazer login.");
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
      logger.warn("auth.sign_out_failed", err);
      const message = getSafeErrorMessage(err, "Erro ao sair.");
      setError(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  const handleTotpSignIn = async (code: string) => {
    if (isPending) return;
    setIsPending(true);
    setError(null);
    try {
      await resolveTotpSignIn(repository, code);
      setMfaRequired(false);
      toast.success("Login realizado com sucesso.");
    } catch (err) {
      logger.warn("auth.totp_sign_in_failed", err);
      const message = getSafeErrorMessage(
        err,
        "Não foi possível validar o código. Tente novamente.",
      );
      setError(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  const handleRegister = async (data: CreateUserRequest) => {
    if (isPending) return;

    setIsPending(true);
    setError(null);

    try {
      await register(repository, data);
      toast.success("Conta criada. Verifique seu e-mail para continuar.");
    } catch (err) {
      logger.error("auth.registration_failed", err);
      const message = getSafeErrorMessage(err, "Erro ao criar conta.");
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
      toast.success(
        "Se houver uma conta associada ao e-mail informado, enviaremos instruções para redefinir a senha.",
      );
      return true;
    } catch (err) {
      if (
        getErrorCode(err) === "auth/user-not-found" ||
        getErrorCode(err) === "auth/email-not-found" ||
        getErrorCode(err) === "auth/invalid-credential"
      ) {
        toast.success(
          "Se houver uma conta associada ao e-mail informado, enviaremos instruções para redefinir a senha.",
        );
        return true;
      }
      logger.warn("auth.password_reset_failed", err);
      const message = getSafeErrorMessage(
        err,
        "Não foi possível solicitar a redefinição agora.",
      );
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsPending(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (isPending) return;
    setIsPending(true);
    try {
      await sendVerificationEmail(repository);
      toast.success("Enviamos um link de verificação para seu e-mail.");
    } catch (err) {
      logger.warn("auth.verification_email_failed", err);
      toast.error(getSafeErrorMessage(err, "Não foi possível enviar o e-mail."));
    } finally {
      setIsPending(false);
    }
  };

  const handleStartTotpEnrollment = async () => {
    if (isPending) return null;
    setIsPending(true);
    try {
      return await startTotpEnrollment(repository);
    } catch (err) {
      logger.warn("auth.totp_enrollment_start_failed", err);
      toast.error(
        getSafeErrorMessage(err, "Não foi possível iniciar a ativação do MFA."),
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  const handleFinishTotpEnrollment = async (code: string) => {
    if (isPending) return false;
    setIsPending(true);
    try {
      await finishTotpEnrollment(repository, code);
      toast.success("Autenticação TOTP ativada.");
      return true;
    } catch (err) {
      logger.warn("auth.totp_enrollment_failed", err);
      toast.error(
        getSafeErrorMessage(err, "Não foi possível validar o código TOTP."),
      );
      return false;
    } finally {
      setIsPending(false);
    }
  };

  const handleDisableTotp = async (password: string, code: string) => {
    if (isPending) return false;
    setIsPending(true);
    try {
      await disableTotp(repository, password, code);
      toast.success("Autenticação TOTP desativada.");
      return true;
    } catch (err) {
      logger.warn("auth.totp_disable_failed", err);
      toast.error(
        getSafeErrorMessage(
          err,
          "Não foi possível desativar o TOTP. Confira a senha e o código.",
        ),
      );
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    error,
    mfaRequired,
    handleSignIn,
    handleTotpSignIn,
    handleRegister,
    handleSignOut,
    handleForgotPassword,
    handleSendVerificationEmail,
    handleStartTotpEnrollment,
    handleFinishTotpEnrollment,
    handleDisableTotp,
  };
}
