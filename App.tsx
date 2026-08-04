import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { PortalHost } from '@rn-primitives/portal'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import './global.css'

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
  )
}
