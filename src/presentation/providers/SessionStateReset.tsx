import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthState } from "@presentation/auth/providers/AuthProvider";
import { clearUserData, shouldClearUserData } from "@/src/infrastructure/tanstack/session";
import { useTransactionFiltersStore } from "@presentation/transactions/stores/transactionFiltersStore";

// Ao sair da conta (ou trocar de usuário), limpa o cache de dados do servidor e
// os filtros da tela de transações. As preferências do dispositivo permanecem.
export function useResetSessionState() {
  const queryClient = useQueryClient();
  const { user, loading } = useAuthState();
  const previousUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (loading) return;

    const currentUserId = user?.uid ?? null;
    const previousUserId = previousUserIdRef.current;
    previousUserIdRef.current = currentUserId;

    if (shouldClearUserData(previousUserId, currentUserId)) {
      clearUserData(queryClient);
      useTransactionFiltersStore.getState().reset();
    }
  }, [loading, user?.uid, queryClient]);
}

export function SessionStateReset() {
  useResetSessionState();
  return null;
}
