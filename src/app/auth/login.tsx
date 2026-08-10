import { Button } from "@/src/shared/ui/button";
import { Input } from "@/src/shared/ui/input";
import { Label } from "@/src/shared/ui/label";
import { Text } from "@/src/shared/ui/text";
import { loginSchema, type LoginFormData } from "@/src/lib/schemas/auth";
import { cn } from "@/src/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@features/auth/hooks/useAuth";
import { View } from "react-native";

export default function Login() {
  const router = useRouter();
  const { loading, error, handleSignIn } = useAuth();

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

  const onSubmit = async (data: LoginFormData) => {
    try {
      await handleSignIn(data.email, data.password);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <View className="gap-6">
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
                autoComplete="email"
                textContentType="emailAddress"
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

        <Button onPress={handleSubmit(onSubmit)} disabled={loading}>
          <Text>{loading ? "Entrando..." : "Entrar"}</Text>
        </Button>

        <Link href="/auth/register" asChild>
          <Button variant="link">
            <Text>Criar uma conta</Text>
          </Button>
        </Link>
      </View>
    </View>
  );
}
