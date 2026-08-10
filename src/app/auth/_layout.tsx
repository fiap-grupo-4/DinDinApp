import { Slot, Stack } from "expo-router";
import { AuthRepositoryProvider } from "@features/auth/providers/AuthRepositoryProvider";

export default function AuthLayout() {
  return (
    <AuthRepositoryProvider>
      <Stack>
        <Stack.Screen
          name="login"
          options={{ title: "Entrar", headerBackVisible: false }}
        />
        <Stack.Screen name="register" options={{ title: "Criar conta" }} />
      </Stack>
    </AuthRepositoryProvider>
  );
}
