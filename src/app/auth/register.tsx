import { AuthHeader } from "@/src/features/auth/ui/auth-header";
import { IconInput } from "@/src/features/auth/ui/icon-input";
import { registerSchema, type RegisterFormData } from "@/src/lib/schemas/auth";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/shared/ui/button";
import { Label } from "@/src/shared/ui/label";
import { Text } from "@/src/shared/ui/text";
import { useAuth } from "@features/auth/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Lock, Mail, User } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

export default function Register() {
  const { isPending, error, handleRegister } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log(data);
    
    handleRegister({
      fullName: data.fullName,
      email: data.email,
      birthday: "",
      password: data.password,
    });
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
            title="Criar conta"
            subtitle="Preencha seus dados para criar sua conta"
          />

          <View className="-mt-8 flex-1 gap-5 rounded-t-[32px] bg-gray-100 px-6 pb-10 pt-8">
            <View className="gap-2">
              <Label nativeID="register-full-name">Nome completo</Label>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <IconInput
                    icon={User}
                    nativeID="register-full-name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="João Silva"
                    autoComplete="name"
                    textContentType="name"
                    returnKeyType="next"
                    editable={!isPending}
                    aria-invalid={!!errors.fullName}
                    className={cn(errors.fullName && "border-destructive")}
                  />
                )}
              />
              {errors.fullName && (
                <Text className="text-destructive text-sm">
                  {errors.fullName.message}
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Label nativeID="register-email">E-mail</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <IconInput
                    icon={Mail}
                    nativeID="register-email"
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
              <Label nativeID="register-password">Senha</Label>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <IconInput
                    icon={Lock}
                    nativeID="register-password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="••••••••"
                    secureTextEntry
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="next"
                    editable={!isPending}
                    aria-invalid={!!errors.password}
                    className={cn(errors.password && "border-destructive")}
                  />
                )}
              />
              <Text variant="muted" className="text-xs">
                Mínimo 6 caracteres, com letra maiúscula, minúscula e
                caractere especial.
              </Text>
              {errors.password && (
                <Text className="text-destructive text-sm">
                  {errors.password.message}
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Label nativeID="register-confirm-password">
                Confirmar senha
              </Label>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <IconInput
                    icon={Lock}
                    nativeID="register-confirm-password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="••••••••"
                    secureTextEntry
                    autoComplete="password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    editable={!isPending}
                    aria-invalid={!!errors.confirmPassword}
                    className={cn(
                      errors.confirmPassword && "border-destructive",
                    )}
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text className="text-destructive text-sm">
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            {error && <Text className="text-destructive text-sm">{error}</Text>}

            <View className="gap-4">
              <Button
                onPress={handleSubmit(onSubmit)}
                disabled={isPending}
                className="bg-brand-600 active:bg-brand-700"
              >
                <Text>{isPending ? "Criando..." : "Criar conta"}</Text>
              </Button>

              <Link href="/auth/login" asChild>
                <Button
                  variant="outline"
                  disabled={isPending}
                  className="border-brand-600"
                >
                  <Text className="text-brand-600">Já tenho uma conta</Text>
                </Button>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
