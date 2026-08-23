import { AuthHeader } from "@/src/features/auth/ui/auth-header";
import { IconInput } from "@/src/features/auth/ui/icon-input";
import { Button } from "@/src/shared/ui/button";
import { Label } from "@/src/shared/ui/label";
import { Text } from "@/src/shared/ui/text";
import { loginSchema, type LoginFormData } from "@/src/lib/schemas/auth";
import { cn } from "@/src/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Lock, Mail } from "lucide-react-native";
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
    <View className="flex-1 bg-brand-600">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <AuthHeader
            title="Entrar"
            subtitle="Informe seu e-mail e senha para acessar sua conta"
          />

          <View className="-mt-6 flex-1 gap-8 rounded-t-[32px] bg-gray-100 px-6 pb-10 pt-10">
            <View className="gap-2">
              <Label nativeID="login-email">E-mail</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <IconInput
                    icon={Mail}
                    nativeID="login-email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="exemplo@email.com"
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
                  <IconInput
                    icon={Lock}
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

              <Link href="/auth/forgot-password" asChild>
                <Button
                  variant="link"
                  size="sm"
                  className="native:h-auto self-end px-0 py-0"
                  disabled={isPending}
                >
                  <Text className="text-brand-600 text-sm">
                    Esqueceu a senha?
                  </Text>
                </Button>
              </Link>
            </View>

            {error && <Text className="text-destructive text-sm">{error}</Text>}

            <View className="gap-4">
              <Button
                onPress={handleSubmit(onSubmit)}
                disabled={isPending}
                className="bg-brand-600 active:bg-brand-700"
              >
                <Text>{isPending ? "Entrando..." : "Entrar"}</Text>
              </Button>

              <View className="flex-row items-center gap-3">
                <View className="h-px flex-1 bg-brand-600" />
                <Text variant="muted" className="text-sm text-brand-600">
                  ou
                </Text>
                <View className="h-px flex-1 bg-brand-600" />
              </View>

              <Link href="/auth/register" asChild>
                <Button
                  variant="outline"
                  disabled={isPending}
                  className="border-brand-600"
                >
                  <Text className="text-brand-600">Criar conta</Text>
                </Button>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
