import { Stack } from "expo-router";
import { useRequireAuth } from "@features/auth/hooks/useRequireAuth";

export default function TransactionsLayout() {
  useRequireAuth();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Transações" }} />
    </Stack>
  );
}
