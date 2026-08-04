import { Text } from '@/components/ui/text'
import { View } from 'react-native'

type ScreenPlaceholderProps = {
  name: string
}

export function ScreenPlaceholder({ name }: ScreenPlaceholderProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-foreground">oi {name}</Text>
    </View>
  )
}
