import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { Link } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <View className="gap-6">
        <View className="gap-2">
          <Label nativeID="register-full-name">Nome completo</Label>
          <Input
            nativeID="register-full-name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Seu nome"
            autoComplete="name"
            textContentType="name"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="register-email">E-mail</Label>
          <Input
            nativeID="register-email"
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
          <Label nativeID="register-password">Senha</Label>
          <Input
            nativeID="register-password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
        </View>

        <Link href="/login" asChild>
          <Button variant="outline">
            <Text>Voltar ao login</Text>
          </Button>
        </Link>
      </View>
    </View>
  )
}
