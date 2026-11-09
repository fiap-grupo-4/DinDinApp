import { Button } from "@/src/shared/ui/button";
import { Text } from "@/src/shared/ui/text";
import { useAuth } from "@presentation/auth/hooks/useAuth";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import { useState } from "react";
import { View } from "react-native";
import { toast } from "@/src/lib/sonner";
import { logger } from "@lib/logger";

export function VerifyEmailScreen() {
  const { user, refreshUser } = useAuthState();
  const { handleSendVerificationEmail, handleSignOut } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const checkVerification = async () => {
    setIsChecking(true);
    try {
      await refreshUser();
    } catch (error) {
      logger.warn("auth.verification_refresh_failed", error);
      toast.error("Não foi possível verificar agora. Tente novamente.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View className="flex-1 justify-center gap-6 rounded-t-2xl bg-gray-100 px-6 py-10">
      <View className="gap-3">
        <Text variant="h3">Verifique seu e-mail</Text>
        <Text variant="muted">
          Enviamos um link para {user?.email || "seu endereço de e-mail"}. Abra
          o link e depois confirme abaixo para liberar sua conta.
        </Text>
      </View>
      <Button onPress={checkVerification} disabled={isChecking}>
        <Text>{isChecking ? "Verificando..." : "Já verifiquei meu e-mail"}</Text>
      </Button>
      <Button variant="outline" onPress={handleSendVerificationEmail}>
        <Text>Reenviar link de verificação</Text>
      </Button>
      <Button variant="ghost" onPress={handleSignOut}>
        <Text>Sair da conta</Text>
      </Button>
    </View>
  );
}

export default VerifyEmailScreen;
