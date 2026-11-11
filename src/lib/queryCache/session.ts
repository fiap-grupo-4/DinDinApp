import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

// Remove do cache (e, por consequência, do cache persistido) os dados
// financeiros de quem saiu, para não ficarem gravados no dispositivo.
export function clearUserData(queryClient: QueryClient): void {
  void queryClient.cancelQueries();
  queryClient.removeQueries({ queryKey: queryKeys.transactions.root });
  queryClient.removeQueries({ queryKey: queryKeys.categories.root });
  queryClient.removeQueries({ queryKey: queryKeys.savingsGoals.root });
}

// Decide se a troca de sessão exige limpar o cache. `undefined` quer dizer que
// a autenticação ainda não tinha sido resolvida nenhuma vez.
export function shouldClearUserData(
  previousUserId: string | null | undefined,
  currentUserId: string | null,
): boolean {
  if (previousUserId === undefined) return currentUserId === null;
  return previousUserId !== currentUserId;
}
