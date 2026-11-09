# Din Din App

Aplicativo mobile de finanças pessoais desenvolvido com React Native, Expo e TypeScript, como parte do projeto acadêmico da FIAP.

## Visão geral

O projeto foi reorganizado com uma estrutura baseada em Domain-Driven Design (DDD) para separar claramente responsabilidades e facilitar a evolução do app. A ideia central é manter a regra de negócio no domínio, enquanto a camada de interface e infraestrutura cuidam da experiência e da integração com serviços externos.

## Tecnologias

- [Expo](https://expo.dev/) SDK 58
- [React Native](https://reactnative.dev/) 0.88
- [React](https://react.dev/) 19.3
- [Expo Router](https://docs.expo.dev/router/introduction/) ~58
- [TypeScript](https://www.typescriptlang.org/) ~6.0
- [Biome](https://biomejs.dev/) 2.2.3 — lint do código em `src/`
- [NativeWind](https://www.nativewind.dev/) 4 (Tailwind CSS para React Native)
- [Firebase](https://firebase.google.com/) 12 (Auth com MFA TOTP, Firestore e Cloud Storage)
- [React Native Reusables](https://rnr-docs.vercel.app/) — componentes baseados em `@rn-primitives`
- [Lucide React Native](https://lucide.dev/) — ícones
- [Vitest](https://vitest.dev/) 3 — testes unitários e testes das Security Rules

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm ou yarn
- [Expo Go](https://expo.dev/go) (SDK 58) no dispositivo físico, ou emulador Android/iOS configurado
- [Java](https://adoptium.net/) 17 ou superior — apenas para os testes das Security Rules no Emulator Suite
- [Firebase CLI](https://firebase.google.com/docs/cli) — para publicar regras e rodar o Emulator Suite
- [Google Cloud CLI](https://cloud.google.com/sdk) autenticado — apenas para os scripts administrativos (seed e MFA TOTP)

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

### Firebase Security Rules

As regras do Firestore e do Storage, além dos índices, ficam junto da infraestrutura compartilhada em `src/infrastructure/firebase/`. Elas permitem que cada usuário autenticado acesse somente os próprios dados e comprovantes. As regras do Firestore também validam os campos de cada documento (chaves permitidas, tipos e limites de tamanho), limitam consultas a 100 documentos e exigem e-mail verificado (`email_verified`) para criar, atualizar e excluir categorias, transações e metas. O `firebase.json` permanece na raiz, conforme a convenção da Firebase CLI, e aponta para esses arquivos.

Antes de usar categorias, transações ou metas de economia, publique as regras e os índices no projeto Firebase:

```bash
npx firebase-tools login
npx firebase-tools use <project-id>
npx firebase-tools deploy --only firestore
```

O `<project-id>` deve ser o mesmo configurado em `EXPO_PUBLIC_FIREBASE_PROJECT_ID`.

Para usar comprovantes, habilite o Cloud Storage no Console do Firebase, configure `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` com o bucket criado e publique as regras:

```bash
npx firebase-tools deploy --only storage
```

Os comprovantes são aceitos somente como imagens JPEG, PNG, WebP ou HEIC de até 5 MB e ficam em `receipts/{userId}/`. As operações feitas pelo SDK exigem que o usuário autenticado seja o proprietário; as URLs de download geradas devem ser tratadas como dados privados e não devem ser compartilhadas.

### Autenticação e MFA TOTP

O cadastro envia um e-mail de verificação e as regras do Firestore só liberam as escritas financeiras depois que o usuário confirma o endereço. O app também suporta autenticação em duas etapas com TOTP (aplicativo autenticador), sem uso de SMS.

O TOTP exige que o projeto Firebase tenha passado pelo upgrade para o Identity Platform — no plano Spark, o limite passa a ser de 3.000 usuários ativos por dia, sem cobrança. A ativação é feita por projeto com um script administrativo protegido por confirmação explícita:

```bash
gcloud auth application-default login
npm run firebase:enable-totp-mfa -- --confirm-project=<project-id>
```

O script habilita apenas o provedor TOTP; nenhum provedor de SMS é ativado.

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

O código segue Clean Architecture, com quatro camadas e uma regra de dependência que aponta sempre para dentro:

```text
din-din-app/
├── src/
│   ├── domain/              # Regras puras: entidades, contratos e serviços (sem React nem Firebase)
│   │   ├── shared/          # Erros de domínio (ValidationError, NotFoundError)
│   │   ├── auth/ categories/ savings/
│   │   └── transactions/
│   │       ├── entities/    # Transaction, TransactionFiltersValue
│   │       ├── repositories/# ITransactionRepository, IReceiptStorage
│   │       └── services/    # Cálculos do dashboard e filtros, como funções puras
│   ├── application/         # Casos de uso com validação (valor positivo, categoria do próprio usuário, ownership)
│   ├── infrastructure/
│   │   └── firebase/        # SDK, repositórios Firestore, Storage, regras e índices
│   ├── presentation/        # Telas, hooks e contexto de repositórios, por funcionalidade
│   │   └── providers/       # RepositoriesContext + useRepositories()
│   ├── main/                # Ponto de composição: AppRepositoriesProvider instancia os repositórios
│   ├── app/                 # Rotas e layouts do expo-router
│   ├── lib/                 # Utilidades de apresentação (moeda, schemas de formulário, toast)
│   ├── shared/ui/           # Componentes de UI reutilizáveis
│   └── styles/              # Estilos globais e tokens
├── tests/rules/             # Testes das Security Rules (Emulator Suite)
├── vitest.config.ts
├── vitest.rules.config.ts
└── biome.json
```

| Camada           | Pode importar                         |
| ---------------- | ------------------------------------- |
| `domain`         | nada além de si mesma                 |
| `application`    | `domain`                              |
| `infrastructure` | `domain` e SDKs externos (Firebase)   |
| `presentation`   | `domain`, `application`, `lib`, `shared` |
| `main`           | todas (é o único lugar que conhece a infraestrutura) |

A regra é verificada pelo lint (`style/noRestrictedImports` nos `overrides` do `biome.json`): um import proibido quebra o `npm run lint`.

Os repositórios são montados uma única vez em `src/app/_layout.tsx` por `AppRepositoriesProvider`, e as telas e hooks os obtêm com `useRepositories()`. Para testar uma tela com repositórios fake, passe `repositories` ao provider.

## Conceitos de DDD aplicados

- Entidades: representam os principais objetos do domínio, como usuário, categoria, transação e meta de economia.
- Serviços de domínio: funções puras com as regras de cálculo, como saldo, resumos do período e evolução mensal.
- Casos de uso: encapsulam os fluxos da aplicação e validam as regras de negócio antes de persistir.
- Repositórios: definem contratos para acesso aos dados, deixando a regra de negócio independente da infraestrutura.
- Infraestrutura: implementa esses contratos com tecnologias concretas, como Firebase.

## Testes

Os serviços do domínio e os casos de uso têm testes unitários com [Vitest](https://vitest.dev/), usando repositórios em memória (`src/test/fakes/`).

```bash
npm test
```

As regras do Firestore e do Storage têm testes dedicados em `tests/rules/`, executados contra o Emulator Suite (requer Java instalado):

```bash
npm run test:rules
```

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

# Format + lint + type-check + testes
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
| `npm test`            | Roda os testes unitários (Vitest)       |
| `npm run test:rules`  | Roda os testes das Security Rules no Emulator Suite |
| `npm run check-all`   | Format + lint + type-check + testes     |
| `npm run generate:mocks` | Cria categorias e transações de exemplo no Firestore |
| `npm run firebase:enable-totp-mfa` | Habilita MFA TOTP no projeto Firebase (Admin SDK) |

### Gerando dados de exemplo

O seed carrega automaticamente o arquivo `.env`. Informe o UID de um usuário já cadastrado e o projeto autorizado:

```env
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
SEED_USER_ID=uid-do-usuario
SEED_ALLOWED_PROJECT_ID=seu-project-id
```

O script usa credenciais administrativas locais e exige confirmação explícita do projeto, para evitar gravações acidentais. Autentique o Application Default Credentials e execute:

```bash
gcloud auth application-default login
npm run generate:mocks -- --confirm-project=seu-project-id
```

## Licença

Projeto acadêmico — FIAP.
