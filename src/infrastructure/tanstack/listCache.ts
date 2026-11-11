import type { QueryClient, QueryKey } from "@tanstack/react-query";

type Identifiable = { uid: string };

export type QuerySnapshot = Array<[QueryKey, unknown]>;

let optimisticCounter = 0;

// Id temporário para itens criados de forma otimista, trocado pelo id real
// quando o servidor responde.
export function createOptimisticId(prefix: string): string {
  optimisticCounter += 1;
  return `optimistic-${prefix}-${Date.now()}-${optimisticCounter}`;
}

export function isOptimisticId(uid: string): boolean {
  return uid.startsWith("optimistic-");
}

function isOptimisticItem(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "uid" in value &&
    typeof value.uid === "string" &&
    isOptimisticId(value.uid)
  );
}

// Indica se os dados de uma query (lista simples ou páginas de uma infinite
// query) ainda têm itens otimistas não confirmados pelo servidor.
export function containsOptimisticItem(data: unknown): boolean {
  if (Array.isArray(data)) return data.some(isOptimisticItem);
  if (typeof data === "object" && data !== null && "pages" in data) {
    const { pages } = data as { pages: unknown };
    return (
      Array.isArray(pages) &&
      pages.some(
        (page) =>
          typeof page === "object" &&
          page !== null &&
          "data" in page &&
          containsOptimisticItem(page.data),
      )
    );
  }
  return false;
}

export function prependItem<T extends Identifiable>(
  items: T[] | undefined,
  item: T,
): T[] | undefined {
  if (!items) return items;
  return [item, ...items.filter((current) => current.uid !== item.uid)];
}

export function appendItem<T extends Identifiable>(
  items: T[] | undefined,
  item: T,
): T[] | undefined {
  if (!items) return items;
  return [...items.filter((current) => current.uid !== item.uid), item];
}

export function replaceItem<T extends Identifiable>(
  items: T[] | undefined,
  previousUid: string,
  item: T,
): T[] | undefined {
  if (!items) return items;
  if (!items.some((current) => current.uid === previousUid)) {
    return prependItem(items, item);
  }
  return items
    .filter((current) => current.uid !== item.uid || current.uid === previousUid)
    .map((current) => (current.uid === previousUid ? item : current));
}

export function patchItem<T extends Identifiable>(
  items: T[] | undefined,
  uid: string,
  patch: Partial<NoInfer<T>>,
): T[] | undefined {
  if (!items) return items;
  return items.map((current) =>
    current.uid === uid ? { ...current, ...patch } : current,
  );
}

export function removeItem<T extends Identifiable>(
  items: T[] | undefined,
  uid: string,
): T[] | undefined {
  if (!items) return items;
  return items.filter((current) => current.uid !== uid);
}

// Cancela buscas em andamento (que sobrescreveriam a atualização otimista) e
// guarda o estado atual de todas as queries sob a chave, para rollback.
export async function prepareOptimisticUpdate(
  queryClient: QueryClient,
  queryKey: QueryKey,
): Promise<QuerySnapshot> {
  await queryClient.cancelQueries({ queryKey });
  return queryClient.getQueriesData({ queryKey });
}

export function restoreSnapshot(
  queryClient: QueryClient,
  snapshot: QuerySnapshot | undefined,
): void {
  if (!snapshot) return;
  for (const [queryKey, data] of snapshot) {
    queryClient.setQueryData(queryKey, data);
  }
}
