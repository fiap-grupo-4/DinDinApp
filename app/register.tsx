import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { registerSchema, type RegisterFormData } from '@/lib/schemas/auth'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'

export default function Register() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = (_data: RegisterFormData) => {
    // TODO: integrar autenticação
  }

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <View className="gap-6">
        <View className="gap-2">
          <Label nativeID="register-full-name">Nome completo</Label>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                nativeID="register-full-name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Seu nome"
                autoComplete="name"
                textContentType="name"
                aria-invalid={!!errors.fullName}
                className={cn(errors.fullName && 'border-destructive')}
              />
            )}
          />
          {errors.fullName && (
            <Text className="text-destructive text-sm">{errors.fullName.message}</Text>
          )}
        </View>

        <View className="gap-2">
          <Label nativeID="register-email">E-mail</Label>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                nativeID="register-email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                aria-invalid={!!errors.email}
                className={cn(errors.email && 'border-destructive')}
              />
            )}
          />
          {errors.email && (
            <Text className="text-destructive text-sm">{errors.email.message}</Text>
          )}
        </View>

        <View className="gap-2">
          <Label nativeID="register-password">Senha</Label>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                nativeID="register-password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                aria-invalid={!!errors.password}
                className={cn(errors.password && 'border-destructive')}
              />
            )}
          />
          {errors.password && (
            <Text className="text-destructive text-sm">{errors.password.message}</Text>
          )}
        </View>

        <Button onPress={handleSubmit(onSubmit)}>
          <Text>Criar conta</Text>
        </Button>

        <Link href="/login" asChild>
          <Button variant="outline">
            <Text>Voltar ao login</Text>
          </Button>
        </Link>
      </View>
    </View>
  )
}
