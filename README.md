# Din Din App

Aplicativo mobile de finanças pessoais desenvolvido com React Native e Expo, como parte do projeto acadêmico da FIAP.

## Tecnologias

- [Expo](https://expo.dev/) ~54
- [React Native](https://reactnative.dev/) 0.81
- [TypeScript](https://www.typescriptlang.org/)
- [NativeWind](https://www.nativewind.dev/) (Tailwind CSS para React Native)
- [Firebase](https://firebase.google.com/) (Firestore)
- [React Native Reusables](https://rnr-docs.vercel.app/) — componentes baseados em `@rn-primitives` (estilo shadcn/ui)
- [Lucide React Native](https://lucide.dev/) — ícones

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm ou yarn
- [Expo Go](https://expo.dev/go) no dispositivo físico, ou emulador Android/iOS configurado

## Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd din-din-app
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Preencha o arquivo `.env` com as credenciais do seu projeto Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

> As chaves podem ser obtidas no [Console do Firebase](https://console.firebase.google.com/) em **Configurações do projeto > Seus apps > SDK do Firebase**.

## Executando o app

```bash
# Inicia o servidor de desenvolvimento
npm start

# Abre no Android
npm run android

# Abre no iOS (macOS)
npm run ios

# Abre no navegador
npm run web
```

Para limpar o cache do Metro bundler:

```bash
npx expo start -c
```

## Estrutura do projeto

```
din-din-app/
├── App.tsx                 # Componente raiz
├── components/
│   └── ui/                 # Componentes de interface reutilizáveis
├── lib/
│   ├── firebase.ts         # Configuração do Firebase/Firestore
│   ├── theme.ts            # Tokens de tema (light/dark)
│   └── utils.ts            # Utilitários (cn, etc.)
├── assets/                 # Ícones e imagens
├── global.css              # Variáveis CSS do Tailwind
├── tailwind.config.js      # Configuração do Tailwind/NativeWind
└── .env.example            # Modelo de variáveis de ambiente
```

## Scripts disponíveis

| Comando           | Descrição                          |
| ----------------- | ---------------------------------- |
| `npm start`       | Inicia o Expo Dev Server           |
| `npm run android` | Executa no emulador/dispositivo Android |
| `npm run ios`     | Executa no simulador/dispositivo iOS    |
| `npm run web`     | Executa no navegador               |

## Licença

Projeto acadêmico — FIAP.
