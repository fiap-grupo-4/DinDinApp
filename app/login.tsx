import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { Link } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    // TODO: integrar autenticação
  }

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <View className="gap-6">
        <View className="gap-2">
          <Label nativeID="login-email">E-mail</Label>
          <Input
            nativeID="login-email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="login-password">Senha</Label>
          <Input
            nativeID="login-password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
          />
        </View>

        <Button onPress={handleLogin}>
          <Text>Entrar</Text>
        </Button>

        <Link href="/register" asChild>
          <Button variant="link">
            <Text>Criar uma conta</Text>
          </Button>
        </Link>
      </View>
    </View>
  )
}
