# Din Din App

Aplicativo mobile de finanças pessoais desenvolvido com React Native, Expo e TypeScript, como parte do projeto acadêmico da FIAP.

## Visão geral

O projeto foi reorganizado com uma estrutura baseada em Domain-Driven Design (DDD) para separar claramente responsabilidades e facilitar a evolução do app. A ideia central é manter a regra de negócio no domínio, enquanto a camada de interface e infraestrutura cuidam da experiência e da integração com serviços externos.

## Tecnologias

- [Expo](https://expo.dev/) ~54
- [React Native](https://reactnative.dev/) 0.81
- [TypeScript](https://www.typescriptlang.org/)
- [Biome](https://biomejs.dev/) 2.2.3 — lint do código em `src/`
- [NativeWind](https://www.nativewind.dev/) (Tailwind CSS para React Native)
- [Firebase](https://firebase.google.com/) (Auth e Firestore)
- [React Native Reusables](https://rnr-docs.vercel.app/) — componentes baseados em `@rn-primitives`
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

Preencha o arquivo `.env` com as credenciais do projeto Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

> As chaves podem ser obtidas no [Console do Firebase](https://console.firebase.google.com/) em Configurações do projeto > Seus apps > SDK do Firebase.

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

```text
din-din-app/
├── App.tsx                  # Ponto de entrada da aplicação
├── src/
│   ├── app/                 # Rotas, layouts e telas da aplicação
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── transactions/
│   ├── domain/              # Camada de domínio
│   │   ├── auth/
│   │   ├── categories/
│   │   └── transactions/
│   │       ├── entities/    # Entidades do negócio
│   │       ├── repositories/# Contratos de persistência
│   │       └── use-cases/   # Casos de uso
│   ├── features/            # Módulos por funcionalidade
│   │   ├── auth/
│   │   ├── categories/
│   │   └── transactions/
│   ├── lib/                 # Configurações externas e utilidades
│   ├── shared/              # Componentes e UI reutilizáveis
│   └── styles/              # Estilos globais e tokens
├── babel.config.js
├── package.json
└── README.md
```

## Conceitos de DDD aplicados

- Entidades: representam os principais objetos do domínio, como usuário, categoria e transação.
- Casos de uso: encapsulam as regras e fluxos principais da aplicação, como login, cadastro e gestão de despesas.
- Repositórios: definem contratos para acesso aos dados, deixando a regra de negócio independente da infraestrutura.
- Infraestrutura: implementa esses contratos com tecnologias concretas, como Firebase.
- Features: organizam cada funcionalidade em módulos com hooks, providers e interface, facilitando manutenção e escalabilidade.

## Lint e qualidade

O projeto usa [Biome](https://biomejs.dev/) para lint em `src/`. A configuração fica em `biome.json`. O formatador do Biome está desligado; `npm run format` aplica apenas correções de lint.

Componentes gerados em `src/shared/ui` e o arquivo `src/styles/global.css` ficam fora do lint.

```bash
# Lint (warnings e errors)
npm run lint

# Lint apenas errors
npm run lint-error

# Aplica correções de lint
npm run format

# Type-check
npm run check-types

# Format + lint + type-check
npm run check-all
```

## Scripts disponíveis

| Comando               | Descrição                               |
| --------------------- | --------------------------------------- |
| `npm start`           | Inicia o Expo Dev Server                |
| `npm run android`     | Executa no emulador/dispositivo Android |
| `npm run ios`         | Executa no simulador/dispositivo iOS    |
| `npm run web`         | Executa no navegador                    |
| `npm run lint`        | Roda o Biome em `src/`                  |
| `npm run lint-error`  | Roda o Biome só com errors              |
| `npm run format`      | Aplica correções de lint do Biome       |
| `npm run check-types` | Verifica os tipos com TypeScript        |
| `npm run check-all`   | Format + lint + type-check              |

## Licença

Projeto acadêmico — FIAP.
