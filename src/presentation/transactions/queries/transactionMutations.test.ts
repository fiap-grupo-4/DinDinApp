import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import {
  defaultShouldDehydrateQuery,
  MutationObserver,
  QueryClient,
} from "@tanstack/react-query";
import {
  persistQueryClientRestore,
  persistQueryClientSave,
} from "@tanstack/react-query-persist-client";
import type { Transaction } from "@domain/transactions/entities/Transaction";
import { InMemoryCategoryRepository } from "@/tests/fakes/InMemoryCategoryRepository";
import { InMemoryTransactionRepository } from "@/tests/fakes/InMemoryTransactionRepository";
import { containsOptimisticItem } from "@/src/infrastructure/tanstack/listCache";
import {
  createQueryClient,
  PERSISTED_CACHE_MAX_AGE,
  QUERY_CACHE_BUSTER,
} from "@/src/infrastructure/tanstack/queryClient";
import { queryKeys } from "@/src/infrastructure/tanstack/queryKeys";
import { beforeEach, describe, expect, it } from "vitest";
import {
  flattenTransactionPages,
  type TransactionPages,
} from "./transactionCache";
import {
  createTransactionMutationOptions,
  deleteTransactionMutationOptions,
  updateTransactionMutationOptions,
} from "./transactionMutations";
import {
  transactionHistoryQueryOptions,
  transactionListQueryOptions,
  TRANSACTIONS_PAGE_SIZE,
} from "./transactionQueries";

const USER_ID = "user-1";

function makeTransaction(
  index: number,
  overrides: Partial<Transaction> = {},
): Transaction {
  return {
    uid: `tx-${index}`,
    userId: USER_ID,
    valueInCents: index * 100,
    transactionType: index % 2 === 0 ? "income" : "outcome",
    description: `Transação ${index}`,
    createdAt: new Date(Date.UTC(2026, 5, 15, 12, 0, index)).toISOString(),
    ...overrides,
  };
}

describe("TanStack Query - Transações (cache, paginação, otimismo e persistência)", () => {
  let queryClient: QueryClient;
  let transactions: InMemoryTransactionRepository;
  let categories: InMemoryCategoryRepository;

  beforeEach(() => {
    queryClient = createQueryClient();
    transactions = new InMemoryTransactionRepository();
    categories = new InMemoryCategoryRepository();
  });

  it("respeita o staleTime e compartilha o cache sem buscar de novo o que acabou de ser carregado", async () => {
    transactions.seed(makeTransaction(1), makeTransaction(2));
    const options = transactionHistoryQueryOptions({ transactions }, USER_ID);

    const first = await queryClient.fetchQuery(options);
    const second = await queryClient.fetchQuery(options);

    expect(first).toHaveLength(2);
    expect(second).toEqual(first);
    expect(transactions.calls.listForUser).toHaveLength(1);
  });

  it("pagina com infiniteQueryOptions usando nextCursor no lugar da paginação manual", async () => {
    const total = TRANSACTIONS_PAGE_SIZE + 5;
    for (let i = 1; i <= total; i += 1) {
      transactions.seed(makeTransaction(i));
    }

    const options = transactionListQueryOptions({ transactions }, USER_ID, {});

    // Busca a 1ª página
    const firstPageData = await queryClient.fetchInfiniteQuery(options);
    expect(firstPageData.pages).toHaveLength(1);
    expect(firstPageData.pages[0].data).toHaveLength(TRANSACTIONS_PAGE_SIZE);
    expect(firstPageData.pages[0].nextCursor).not.toBeNull();

    // Busca a 2ª página acumulando no cache
    const secondPageData = await queryClient.fetchInfiniteQuery({
      ...options,
      pages: 2,
      staleTime: 0,
    });
    expect(secondPageData.pages).toHaveLength(2);
    expect(flattenTransactionPages(secondPageData)).toHaveLength(total);
    expect(secondPageData.pages[1].nextCursor).toBeNull();
  });

  it("atualiza otimisticamente a lista e o histórico ao criar, editar e excluir", async () => {
    const existing = makeTransaction(1, { description: "Inicial" });
    transactions.seed(existing);

    const listOptions = transactionListQueryOptions(
      { transactions },
      USER_ID,
      {},
    );
    const historyOptions = transactionHistoryQueryOptions(
      { transactions },
      USER_ID,
    );

    await queryClient.fetchInfiniteQuery(listOptions);
    await queryClient.fetchQuery(historyOptions);

    // 1. Criar com atualização otimista
    let optimisticListDuringCreate: Transaction[] = [];
    let optimisticHistoryDuringCreate: Transaction[] = [];
    const originalCreate = transactions.create.bind(transactions);
    transactions.create = async (data) => {
      optimisticListDuringCreate = flattenTransactionPages(
        queryClient.getQueryData<TransactionPages>(listOptions.queryKey),
      );
      optimisticHistoryDuringCreate =
        queryClient.getQueryData<Transaction[]>(historyOptions.queryKey) ?? [];
      return originalCreate(data);
    };

    const createObserver = new MutationObserver(
      queryClient,
      createTransactionMutationOptions(
        queryClient,
        { transactions, categories },
        USER_ID,
      ),
    );
    const created = await createObserver.mutate({
      valueInCents: 2500,
      transactionType: "income",
      description: "Salário",
    });

    expect(optimisticListDuringCreate[0].description).toBe("Salário");
    expect(optimisticListDuringCreate[0].uid).toMatch(/^optimistic-/);
    expect(optimisticHistoryDuringCreate[0].description).toBe("Salário");

    const listAfterCreate = flattenTransactionPages(
      queryClient.getQueryData<TransactionPages>(listOptions.queryKey),
    );
    expect(listAfterCreate.map((item) => item.uid)).toContain(created.uid);

    // 2. Editar com atualização otimista
    let descriptionDuringUpdate: string | undefined;
    const originalUpdate = transactions.update.bind(transactions);
    transactions.update = async (id, data) => {
      const current =
        queryClient.getQueryData<Transaction[]>(historyOptions.queryKey) ?? [];
      descriptionDuringUpdate = current.find(
        (item) => item.uid === id,
      )?.description;
      return originalUpdate(id, data);
    };

    const updateObserver = new MutationObserver(
      queryClient,
      updateTransactionMutationOptions(
        queryClient,
        { transactions, categories },
        USER_ID,
      ),
    );
    await updateObserver.mutate({
      transactionId: existing.uid,
      data: { description: "Editada" },
    });

    expect(descriptionDuringUpdate).toBe("Editada");

    // 3. Excluir com atualização otimista
    let idsDuringDelete: string[] = [];
    const originalDelete = transactions.delete.bind(transactions);
    transactions.delete = async (id) => {
      const current =
        queryClient.getQueryData<Transaction[]>(historyOptions.queryKey) ?? [];
      idsDuringDelete = current.map((item) => item.uid);
      return originalDelete(id);
    };

    const deleteObserver = new MutationObserver(
      queryClient,
      deleteTransactionMutationOptions(queryClient, { transactions }, USER_ID),
    );
    await deleteObserver.mutate(existing.uid);

    expect(idsDuringDelete).not.toContain(existing.uid);
  });

  it("faz rollback do cache da lista e do histórico quando criar, editar ou excluir falha", async () => {
    const existing = makeTransaction(1, { description: "Original" });
    transactions.seed(existing);

    const listOptions = transactionListQueryOptions(
      { transactions },
      USER_ID,
      {},
    );
    const historyOptions = transactionHistoryQueryOptions(
      { transactions },
      USER_ID,
    );

    await queryClient.fetchInfiniteQuery(listOptions);
    await queryClient.fetchQuery(historyOptions);

    // Evita que o invalidateQueries de onSettled refaça o fetch antes de checarmos o rollback
    transactions.create = async () => {
      throw new Error("falha no servidor");
    };

    const createObserver = new MutationObserver(
      queryClient,
      createTransactionMutationOptions(
        queryClient,
        { transactions, categories },
        USER_ID,
      ),
    );

    await expect(
      createObserver.mutate({
        valueInCents: 900,
        transactionType: "outcome",
        description: "Não deve ficar",
      }),
    ).rejects.toThrow("falha no servidor");

    const historyAfterFailedCreate =
      queryClient.getQueryData<Transaction[]>(historyOptions.queryKey) ?? [];
    expect(historyAfterFailedCreate.map((item) => item.uid)).toEqual([
      existing.uid,
    ]);

    // Rollback ao falhar exclusão
    transactions.delete = async () => {
      throw new Error("falha ao excluir");
    };
    const deleteObserver = new MutationObserver(
      queryClient,
      deleteTransactionMutationOptions(queryClient, { transactions }, USER_ID),
    );

    await expect(deleteObserver.mutate(existing.uid)).rejects.toThrow(
      "falha ao excluir",
    );

    expect(
      queryClient
        .getQueryData<Transaction[]>(historyOptions.queryKey)
        ?.map((item) => item.uid),
    ).toEqual([existing.uid]);
  });

  it("persiste e restaura o cache com @tanstack/query-async-storage-persister sem gravar itens otimistas", async () => {
    const storageMap = new Map<string, string>();
    const asyncStorageStub = {
      getItem: async (key: string) => storageMap.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        storageMap.set(key, value);
      },
      removeItem: async (key: string) => {
        storageMap.delete(key);
      },
    };

    const persister = createAsyncStoragePersister({
      storage: asyncStorageStub,
      key: "dindin.query-cache.test",
      throttleTime: 0,
    });

    const confirmed = makeTransaction(1, { description: "Confirmada" });
    transactions.seed(confirmed);

    const historyKey = queryKeys.transactions.history(USER_ID);
    await queryClient.fetchQuery(
      transactionHistoryQueryOptions({ transactions }, USER_ID),
    );

    // Query com item otimista não deve ser desidratada
    const otherUserHistoryKey = queryKeys.transactions.history("user-optimistic");
    queryClient.setQueryData<Transaction[]>(otherUserHistoryKey, [
      { ...confirmed, uid: "optimistic-transaction-1" },
    ]);

    await persistQueryClientSave({
      queryClient,
      persister,
      buster: QUERY_CACHE_BUSTER,
      dehydrateOptions: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) &&
          !containsOptimisticItem(query.state.data),
      },
    });

    const freshClient = createQueryClient();
    await persistQueryClientRestore({
      queryClient: freshClient,
      persister,
      maxAge: PERSISTED_CACHE_MAX_AGE,
      buster: QUERY_CACHE_BUSTER,
    });

    expect(freshClient.getQueryData<Transaction[]>(historyKey)).toEqual([
      confirmed,
    ]);
    expect(
      freshClient.getQueryData<Transaction[]>(otherUserHistoryKey),
    ).toBeUndefined();
  });
});
