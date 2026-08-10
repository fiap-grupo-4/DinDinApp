import { Button } from "@/src/shared/ui/button";
import { Text } from "@/src/shared/ui/text";
import { PortalHost } from "@rn-primitives/portal";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./src/styles/global.css";

export default function App() {
  return (
    <SafeAreaProvider>
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="mb-4 text-xl font-bold text-foreground">
          Din Din App
        </Text>
        <Button>
          <Text>Começar</Text>
        </Button>
        <StatusBar style="auto" />
      </View>
      <PortalHost />
    </SafeAreaProvider>
  );
}
