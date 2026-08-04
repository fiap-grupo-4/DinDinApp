import { PortalHost } from '@rn-primitives/portal'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="register" options={{ title: 'Register' }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      </Stack>
      <StatusBar style="auto" />
      <PortalHost />
    </SafeAreaProvider>
  )
}
