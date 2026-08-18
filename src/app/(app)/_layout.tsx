import { AppBottomBar } from "@features/app-shell/ui/app-bottom-bar";
import { useRequireAuth } from "@features/auth/hooks/useRequireAuth";
import { useAuthState } from "@/src/features/auth/providers/AuthProvider";
import { Text } from "@/src/shared/ui/text";
import { Stack } from "expo-router";
import { View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const BOTTOM_BAR_HEIGHT = 72;
const HORIZONTAL_INSET = 16;
const FLOATING_GAP = 8;

export default function AppLayout() {
  const { user, loading } = useAuthState();
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, FLOATING_GAP) + FLOATING_GAP;

  useRequireAuth();

  if (loading || !user) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background"
        accessibilityLabel="Carregando área autenticada"
        accessibilityRole="progressbar"
      >
        <Text variant="muted">Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View
        className="flex-1"
        style={{ paddingBottom: BOTTOM_BAR_HEIGHT + bottomOffset }}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="transactions" />
          <Stack.Screen name="account" />
        </Stack>
      </View>
      <View
        className="absolute overflow-visible"
        pointerEvents="box-none"
        style={{
          left: HORIZONTAL_INSET,
          right: HORIZONTAL_INSET,
          bottom: bottomOffset,
        }}
      >
        <AppBottomBar />
      </View>
    </SafeAreaView>
  );
}
