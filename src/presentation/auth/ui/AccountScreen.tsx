import { Avatar, AvatarFallback } from "@/src/shared/ui/avatar";
import { Button } from "@/src/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/src/shared/ui/card";
import { ScreenHeader } from "@/src/shared/ui/screen-header";
import { Separator } from "@/src/shared/ui/separator";
import { Skeleton } from "@/src/shared/ui/skeleton";
import { Text } from "@/src/shared/ui/text";
import { useAuth } from "@presentation/auth/hooks/useAuth";
import { useCurrentUserProfile } from "@presentation/auth/hooks/useCurrentUserProfile";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import { IconInput } from "@/src/shared/ui/icon-input";
import { Lock } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, View } from "react-native";

function getInitials(fullName: string, email: string) {
  const source = fullName.trim() || email.trim();

  if (!source) return "?";

  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatMemberSince(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function AccountProfileSkeleton() {
  return (
    <Card
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando dados da conta"
    >
      <CardHeader className="items-center gap-3">
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-52" />
      </CardHeader>
      <CardContent className="gap-4">
        <Separator />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="gap-1">
      <Text variant="muted" className="text-xs uppercase tracking-wide">
        {label}
      </Text>
      <Text className="text-base">{value}</Text>
    </View>
  );
}

export function AccountScreen() {
  const { profile, isLoading } = useCurrentUserProfile();
  const { user, refreshUser } = useAuthState();
  const {
    handleSignOut,
    isPending,
    handleStartTotpEnrollment,
    handleFinishTotpEnrollment,
    handleDisableTotp,
  } = useAuth();
  const [totpEnrollment, setTotpEnrollment] = useState<{
    secretKey: string;
  } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpDisableVisible, setTotpDisableVisible] = useState(false);
  const [totpDisablePassword, setTotpDisablePassword] = useState("");
  const [totpDisableCode, setTotpDisableCode] = useState("");

  const showSkeleton = !profile || isLoading;

  const displayName = profile?.fullName.trim() || "Nome não informado";
  const displayEmail = profile?.email.trim() || "E-mail não disponível";
  const initials = getInitials(profile?.fullName ?? "", profile?.email ?? "");
  const memberSince = profile?.createdAt
    ? formatMemberSince(profile.createdAt)
    : null;

  const beginTotpEnrollment = async () => {
    const enrollment = await handleStartTotpEnrollment();
    if (enrollment) setTotpEnrollment(enrollment);
  };

  const confirmTotpEnrollment = async () => {
    const enrolled = await handleFinishTotpEnrollment(totpCode);
    if (!enrolled) return;
    await refreshUser();
    setTotpEnrollment(null);
    setTotpCode("");
  };

  const confirmTotpDisable = async () => {
    const disabled = await handleDisableTotp(
      totpDisablePassword,
      totpDisableCode,
    );
    if (!disabled) return;
    await refreshUser();
    setTotpDisableVisible(false);
    setTotpDisablePassword("");
    setTotpDisableCode("");
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-grow px-6 py-8"
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-6">
        <ScreenHeader
          title="Conta"
          subtitle="Veja seus dados e saia da sessão quando quiser."
        />

        {showSkeleton ? (
          <AccountProfileSkeleton />
        ) : (
          <Card>
            <CardHeader className="items-center gap-3">
              <Avatar
                alt={displayName}
                className="size-20"
                accessibilityLabel={`Avatar de ${displayName}`}
              >
                <AvatarFallback className="bg-primary/10">
                  <Text className="text-xl font-semibold text-primary">
                    {initials}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <View className="items-center gap-1">
                <Text variant="h4" className="text-center">
                  {displayName}
                </Text>
                <CardDescription className="text-center">
                  {displayEmail}
                </CardDescription>
              </View>
            </CardHeader>
            <CardContent className="gap-4">
              <Separator />
              <ProfileField label="Nome completo" value={displayName} />
              <ProfileField label="E-mail" value={displayEmail} />
              {memberSince ? (
                <ProfileField label="Membro desde" value={memberSince} />
              ) : null}
              {profile.birthday ? (
                <ProfileField
                  label="Data de nascimento"
                  value={profile.birthday}
                />
              ) : null}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <Text variant="h4">Autenticação em duas etapas</Text>
            <CardDescription>
              {user?.hasTotp
                ? "Um autenticador TOTP está associado à sua conta."
                : "Adicione códigos TOTP de um app autenticador. Não há SMS."}
            </CardDescription>
          </CardHeader>
          {!user?.hasTotp && !totpEnrollment && (
            <CardContent>
              <Button
                onPress={beginTotpEnrollment}
                disabled={!user?.emailVerified}
              >
                <Text>Ativar autenticador TOTP</Text>
              </Button>
              {!user?.emailVerified && (
                <Text variant="muted" className="mt-2 text-sm">
                  Verifique seu e-mail antes de ativar o MFA.
                </Text>
              )}
            </CardContent>
          )}
          {!user?.hasTotp && totpEnrollment && (
            <CardContent className="gap-4">
              <Text>
                No app autenticador, adicione uma conta manualmente com o nome
                DinDinApp e esta chave:
              </Text>
              <Text selectable className="font-semibold tracking-widest">
                {totpEnrollment.secretKey}
              </Text>
              <Text variant="muted" className="text-sm">
                Guarde a chave em local seguro. Qualquer pessoa com ela pode
                gerar códigos para sua conta.
              </Text>
              <IconInput
                icon={Lock}
                nativeID="totp-enrollment-code"
                value={totpCode}
                onChangeText={(value) =>
                  setTotpCode(value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Código de seis dígitos"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                maxLength={6}
                editable={!isPending}
              />
              <Button
                onPress={confirmTotpEnrollment}
                disabled={isPending || totpCode.length !== 6}
              >
                <Text>
                  {isPending ? "Ativando..." : "Confirmar e ativar TOTP"}
                </Text>
              </Button>
            </CardContent>
          )}
          {user?.hasTotp && !totpDisableVisible && (
            <CardContent>
              <Button
                variant="outline"
                onPress={() => setTotpDisableVisible(true)}
              >
                <Text>Desativar TOTP</Text>
              </Button>
            </CardContent>
          )}
          {user?.hasTotp && totpDisableVisible && (
            <CardContent className="gap-4">
              <Text>
                Para desativar, confirme sua senha e o código atual do
                autenticador.
              </Text>
              <IconInput
                icon={Lock}
                nativeID="totp-disable-password"
                value={totpDisablePassword}
                onChangeText={setTotpDisablePassword}
                placeholder="Senha"
                secureTextEntry
                autoComplete="current-password"
                editable={!isPending}
              />
              <IconInput
                icon={Lock}
                nativeID="totp-disable-code"
                value={totpDisableCode}
                onChangeText={(value) =>
                  setTotpDisableCode(value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Código TOTP"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                maxLength={6}
                editable={!isPending}
              />
              <Button
                variant="destructive"
                onPress={confirmTotpDisable}
                disabled={
                  isPending ||
                  !totpDisablePassword ||
                  totpDisableCode.length !== 6
                }
              >
                <Text>Confirmar desativação</Text>
              </Button>
              <Button
                variant="ghost"
                onPress={() => setTotpDisableVisible(false)}
                disabled={isPending}
              >
                <Text>Cancelar</Text>
              </Button>
            </CardContent>
          )}
        </Card>

        <Button
          variant="destructive"
          accessibilityLabel="Sair da conta"
          accessibilityState={{ busy: isPending, disabled: isPending }}
          disabled={isPending}
          onPress={handleSignOut}
        >
          <Text>{isPending ? "Saindo..." : "Sair"}</Text>
        </Button>
      </View>
    </ScrollView>
  );
}

export default AccountScreen;
