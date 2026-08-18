import { Button } from "@/src/shared/ui/button";
import { Input } from "@/src/shared/ui/input";
import { Label } from "@/src/shared/ui/label";
import { Text } from "@/src/shared/ui/text";
import { loginSchema, type LoginFormData } from "@/src/lib/schemas/auth";
import { cn } from "@/src/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@features/auth/hooks/useAuth";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

export default function Login() {
  const { isPending, error, handleSignIn } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    handleSignIn(data.email, data.password);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-6">
          <View className="gap-2">
            <Text variant="h3" className="text-left">
              Entrar
            </Text>
            <Text variant="muted">Acesse sua conta para continuar</Text>
          </View>

          <View className="gap-2">
            <Label nativeID="login-email">E-mail</Label>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  nativeID="login-email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  editable={!isPending}
                  aria-invalid={!!errors.email}
                  className={cn(errors.email && "border-destructive")}
                />
              )}
            />
            {errors.email && (
              <Text className="text-destructive text-sm">
                {errors.email.message}
              </Text>
            )}
          </View>

          <View className="gap-2">
            <Label nativeID="login-password">Senha</Label>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  nativeID="login-password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  editable={!isPending}
                  aria-invalid={!!errors.password}
                  className={cn(errors.password && "border-destructive")}
                />
              )}
            />
            {errors.password && (
              <Text className="text-destructive text-sm">
                {errors.password.message}
              </Text>
            )}
          </View>

          {error && <Text className="text-destructive text-sm">{error}</Text>}

          <Button onPress={handleSubmit(onSubmit)} disabled={isPending}>
            <Text>{isPending ? "Entrando..." : "Entrar"}</Text>
          </Button>

          <Link href="/auth/register" asChild>
            <Button variant="link" disabled={isPending}>
              <Text>Criar uma conta</Text>
            </Button>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
