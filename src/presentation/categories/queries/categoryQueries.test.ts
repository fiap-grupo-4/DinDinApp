import { MutationObserver, QueryClient } from "@tanstack/react-query";
import type { Category } from "@domain/categories/entities/Category";
import { InMemoryCategoryRepository } from "@/src/test/fakes/InMemoryCategoryRepository";
import { createQueryClient } from "@presentation/query/queryClient";
import { beforeEach, describe, expect, it } from "vitest";
import {
  categoriesQueryOptions,
  createCategoryMutationOptions,
} from "./categoryQueries";

const USER_ID = "user-1";

const initialCategory: Category = {
  uid: "cat-initial",
  userId: USER_ID,
  name: "Alimentação",
  createdAt: "2026-06-01T12:00:00.000Z",
};

describe("categoryQueries", () => {
  let queryClient: QueryClient;
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    queryClient = createQueryClient();
    repository = new InMemoryCategoryRepository();
    repository.seed(initialCategory);
  });

  it("compartilha o cache de categorias entre telas respeitando o staleTime", async () => {
    const options = categoriesQueryOptions(repository, USER_ID);

    const first = await queryClient.fetchQuery(options);
    const second = await queryClient.fetchQuery(options);

    expect(first).toEqual([initialCategory]);
    expect(second).toEqual([initialCategory]);
    expect(repository.calls.listForUser).toHaveLength(1);
  });

  it("adiciona categoria otimisticamente e substitui pelo registro real ao concluir", async () => {
    const options = categoriesQueryOptions(repository, USER_ID);
    await queryClient.fetchQuery(options);

    let optimisticDuringCreate: Category[] = [];
    const originalCreate = repository.create.bind(repository);
    repository.create = async (data) => {
      optimisticDuringCreate =
        queryClient.getQueryData<Category[]>(options.queryKey) ?? [];
      return originalCreate(data);
    };

    const observer = new MutationObserver(
      queryClient,
      createCategoryMutationOptions(queryClient, repository),
    );
    const created = await observer.mutate({
      userId: USER_ID,
      name: "Transporte",
    });

    expect(optimisticDuringCreate).toHaveLength(2);
    expect(optimisticDuringCreate[1].name).toBe("Transporte");
    expect(optimisticDuringCreate[1].uid).toMatch(/^optimistic-category-/);

    const finalList =
      queryClient.getQueryData<Category[]>(options.queryKey) ?? [];
    expect(finalList.map((item) => item.uid)).toEqual([
      initialCategory.uid,
      created.uid,
    ]);
  });

  it("desfaz a adição otimista de categoria se o repositório falhar", async () => {
    const options = categoriesQueryOptions(repository, USER_ID);
    await queryClient.fetchQuery(options);

    repository.create = async () => {
      throw new Error("falha ao criar categoria");
    };

    const observer = new MutationObserver(
      queryClient,
      createCategoryMutationOptions(queryClient, repository),
    );

    await expect(
      observer.mutate({ userId: USER_ID, name: "Lazer" }),
    ).rejects.toThrow("falha ao criar categoria");

    expect(queryClient.getQueryData<Category[]>(options.queryKey)).toEqual([
      initialCategory,
    ]);
  });
});
