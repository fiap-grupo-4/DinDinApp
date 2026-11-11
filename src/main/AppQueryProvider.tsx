import { ReactNode } from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  defaultShouldDehydrateQuery,
  focusManager,
  QueryClient,
} from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
  type PersistQueryClientOptions,
} from "@tanstack/react-query-persist-client";
import { containsOptimisticItem } from "@lib/queryCache/listCache";
import {
  createQueryClient,
  PERSISTED_CACHE_MAX_AGE,
  QUERY_CACHE_BUSTER,
} from "@lib/queryCache/queryClient";

export const QUERY_CACHE_STORAGE_KEY = "dindin.query-cache";

type PersistOptions = Omit<PersistQueryClientOptions, "queryClient">;

let defaultQueryClient: QueryClient | null = null;
let defaultPersistOptions: PersistOptions | null = null;

function getDefaultQueryClient(): QueryClient {
  if (!defaultQueryClient) {
    defaultQueryClient = createQueryClient();
    setupAppStateFocus();
  }
  return defaultQueryClient;
}

function getDefaultPersistOptions(): PersistOptions {
  if (!defaultPersistOptions) {
    defaultPersistOptions = {
      persister: createAsyncStoragePersister({
        storage: AsyncStorage,
        key: QUERY_CACHE_STORAGE_KEY,
      }),
      maxAge: PERSISTED_CACHE_MAX_AGE,
      buster: QUERY_CACHE_BUSTER,
      dehydrateOptions: {
        // Só persiste dados confirmados pelo servidor: um item otimista salvo
        // apareceria de novo se o app fosse fechado no meio da mutação.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) &&
          !containsOptimisticItem(query.state.data),
      },
    };
  }
  return defaultPersistOptions;
}

// No mobile não existe foco de janela: o app "ganha foco" ao voltar do
// background, e aí as queries vencidas (staleTime) são revalidadas.
function setupAppStateFocus() {
  if (Platform.OS === "web") return;
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener("change", (status) =>
      handleFocus(status === "active"),
    );
    return () => subscription.remove();
  });
}

// Restaura o cache salvo no AsyncStorage antes das queries rodarem: o app abre
// já mostrando os últimos dados e revalida em seguida o que estiver vencido.
export function AppQueryProvider({
  children,
  client,
  persistOptions,
}: {
  children: ReactNode;
  client?: QueryClient;
  persistOptions?: PersistOptions;
}) {
  return (
    <PersistQueryClientProvider
      client={client ?? getDefaultQueryClient()}
      persistOptions={persistOptions ?? getDefaultPersistOptions()}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
