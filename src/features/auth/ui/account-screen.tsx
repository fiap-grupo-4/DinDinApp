import { Avatar, AvatarFallback } from "@/src/shared/ui/avatar";
import { Button } from "@/src/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/src/shared/ui/card";
import { Separator } from "@/src/shared/ui/separator";
import { Skeleton } from "@/src/shared/ui/skeleton";
import { Text } from "@/src/shared/ui/text";
import { useAuth } from "@features/auth/hooks/useAuth";
import { useCurrentUserProfile } from "@features/auth/hooks/useCurrentUserProfile";
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
  const { profile } = useCurrentUserProfile();
  const { handleSignOut, isPending } = useAuth();

  const displayName = profile?.fullName.trim() || "Nome não informado";
  const displayEmail = profile?.email.trim() || "E-mail não disponível";
  const initials = getInitials(profile?.fullName ?? "", profile?.email ?? "");
  const memberSince = profile?.createdAt
    ? formatMemberSince(profile.createdAt)
    : null;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-grow px-6 py-8"
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-6">
        <View className="gap-2">
          <Text variant="h3" className="text-left">
            Conta
          </Text>
          <Text variant="muted">
            Veja seus dados e saia da sessão quando quiser.
          </Text>
        </View>

        {!profile ? (
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
