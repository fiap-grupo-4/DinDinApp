import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Link } from 'expo-router'
import { View } from 'react-native'

export default function Login() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Link href="/register" asChild>
        <Button variant="outline">
          <Text>Ir para o cadastro</Text>
        </Button>
      </Link>
    </View>
  )
}
