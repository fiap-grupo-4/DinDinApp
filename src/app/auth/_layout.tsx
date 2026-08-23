import { Logo } from "@/src/shared/ui/logo";
import { Text } from "@/src/shared/ui/text";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const headers = {
  login: {
    title: "Entrar",
    subtitle: "Informe seu e-mail e senha para acessar sua conta",
  },
  register: {
    title: "Criar conta",
    subtitle: "Preencha seus dados para criar sua conta",
  },
  "forgot-password": {
    title: "Esqueci a senha",
    subtitle: "Informe seu e-mail para receber o link de redefinição",
  },
} as const;

export default function AuthLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-brand-600">
      <StatusBar style="light" />

      <Stack
        screenOptions={({ route }) => {
          const header = headers[route.name as keyof typeof headers];

          return {
            headerShown: true,
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: "transparent",
            },
            header: () =>
              header ? (
                <View
                  className="items-center gap-10 bg-brand-600 px-6 pb-14"
                  style={{ paddingTop: insets.top + 20 }}
                >
                  <Logo height={32} />
                  <View className="items-center gap-2">
                    <Text className="text-2xl font-semibold text-brand-100">
                      {header.title}
                    </Text>
                    <Text className="max-w-[280px] text-center text-sm text-brand-200">
                      {header.subtitle}
                    </Text>
                  </View>
                </View>
              ) : null,
          };
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </View>
  );
}
