import { QueryClient } from "@tanstack/react-query";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Dados considerados "frescos": dentro desse intervalo o cache é servido sem
// nova requisição, mesmo ao trocar de tela.
export const DEFAULT_STALE_TIME = MINUTE;

// Categorias mudam pouco; podem ficar mais tempo sem revalidar.
export const CATEGORIES_STALE_TIME = 10 * MINUTE;

// Tempo máximo que o cache persistido no dispositivo é aceito na abertura do
// app. O gcTime precisa ser maior ou igual, senão as queries saem da memória
// antes de serem salvas.
export const PERSISTED_CACHE_MAX_AGE = 24 * HOUR;

// Troque quando o formato dos dados em cache mudar, para descartar o cache
// salvo por versões anteriores do app.
export const QUERY_CACHE_BUSTER = "dindin-query-v1";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME,
        gcTime: PERSISTED_CACHE_MAX_AGE,
        retry: 2,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
