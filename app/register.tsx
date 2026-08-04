import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Link } from 'expo-router'
import { View } from 'react-native'

export default function Register() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Link href="/login" asChild>
        <Button variant="outline">
          <Text>Ir para o login</Text>
        </Button>
      </Link>
    </View>
  )
}
