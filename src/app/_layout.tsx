import "react-native-gesture-handler";
import "../styles/global.css";

import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "@/src/lib/sonner";
import { AuthProvider } from "@presentation/auth/providers/AuthProvider";
import { SessionStateReset } from "@presentation/providers/SessionStateReset";
import { AppQueryProvider } from "@main/AppQueryProvider";
import { AppRepositoriesProvider } from "@main/AppRepositoriesProvider";
import { Button } from "@/src/shared/ui/button";
import { Text } from "@/src/shared/ui/text";
import { logger } from "@lib/logger";
import { useEffect } from "react";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppRepositoriesProvider>
          <AppQueryProvider>
            <AuthProvider>
              <SessionStateReset />
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
              </Stack>
            </AuthProvider>
          </AppQueryProvider>
        </AppRepositoriesProvider>
        <StatusBar style="auto" />
        <PortalHost />
        <Toaster />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  useEffect(() => {
    logger.error("app.unhandled_error", error);
  }, [error]);

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
      <Text variant="h3">Algo deu errado</Text>
      <Text variant="muted" className="text-center">
        Ocorreu um erro inesperado. Tente novamente.
      </Text>
      <Button onPress={retry}>
        <Text>Tentar novamente</Text>
      </Button>
    </View>
  );
}
