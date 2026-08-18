import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{ title: "Entrar", headerBackVisible: false }}
      />
      <Stack.Screen name="register" options={{ title: "Criar conta" }} />
      <Stack.Screen
        name="forgot-password"
        options={{ title: "Esqueci a senha" }}
      />
    </Stack>
  );
}
