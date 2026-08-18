import { Button } from "@/src/shared/ui/button";
import { Input } from "@/src/shared/ui/input";
import { Label } from "@/src/shared/ui/label";
import { Text } from "@/src/shared/ui/text";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/src/lib/schemas/auth";
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

export default function ForgotPassword() {
  const { isPending, error, handleForgotPassword } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    handleForgotPassword(data.email);
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
              Esqueci a senha
            </Text>
            <Text variant="muted">
              Informe seu e-mail para receber o link de redefinição
            </Text>
          </View>

          <View className="gap-2">
            <Label nativeID="forgot-password-email">E-mail</Label>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  nativeID="forgot-password-email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
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

          {error && <Text className="text-destructive text-sm">{error}</Text>}

          <Button onPress={handleSubmit(onSubmit)} disabled={isPending}>
            <Text>{isPending ? "Enviando..." : "Enviar e-mail"}</Text>
          </Button>

          <Link href="/auth/login" asChild>
            <Button variant="outline" disabled={isPending}>
              <Text>Voltar ao login</Text>
            </Button>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
