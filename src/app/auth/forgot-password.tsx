import { Alert, AlertDescription, AlertTitle } from "@/src/shared/ui/alert";
import { Button } from "@/src/shared/ui/button";
import { Label } from "@/src/shared/ui/label";
import { Text } from "@/src/shared/ui/text";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/src/lib/schemas/auth";
import { cn } from "@/src/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Mail, MailCheck } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@features/auth/hooks/useAuth";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthHeader } from "@/src/features/auth/ui/auth-header";
import { IconInput } from "@/src/features/auth/ui/icon-input";

export default function ForgotPassword() {
  const { isPending, error, handleForgotPassword } = useAuth();
  const [isEmailSent, setIsEmailSent] = useState(false);

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

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const didSend = await handleForgotPassword(data.email);
    if (didSend) {
      setIsEmailSent(true);
    }
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
            title="Esqueci a senha"
            subtitle="Informe seu e-mail para receber o link de redefinição"
          />

          <View className="flex-1 gap-12 rounded-t-[32px] bg-gray-100 px-6 pb-10 pt-12">
            <View className="gap-2">
              <Label nativeID="forgot-password-email">E-mail</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <IconInput
                    icon={Mail}
                    nativeID="forgot-password-email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="exemplo@email.com"
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

            <View className="gap-4 mb-12">
              <Button
                onPress={handleSubmit(onSubmit)}
                disabled={isPending}
                className="bg-brand-600 active:bg-brand-700"
              >
                <Text>{isPending ? "Enviando..." : "Enviar e-mail"}</Text>
              </Button>

              <Link href="/auth/login" asChild>
                <Button
                  variant="outline"
                  disabled={isPending}
                  className="border-brand-600"
                >
                  <Text className="text-brand-600">Voltar ao login</Text>
                </Button>
              </Link>
            </View>

            {isEmailSent && (
              <View className="mb-12">
                <Alert 
                  icon={MailCheck} 
                  accessibilityLabel="E-mail enviado" 
                  iconClassName="text-brand-600" 
                  className="border-brand-600"
                >
                  <AlertTitle className="text-brand-600">E-mail enviado</AlertTitle>
                  <AlertDescription>
                    Verifique sua caixa de entrada e a pasta de spam para redefinir
                    a senha.
                  </AlertDescription>
                </Alert>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
