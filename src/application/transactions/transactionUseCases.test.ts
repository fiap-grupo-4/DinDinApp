import { NotFoundError, ValidationError } from "@domain/shared/errors";
import { Transaction } from "@domain/transactions/entities/Transaction";
import { InMemoryCategoryRepository } from "@/src/test/fakes/InMemoryCategoryRepository";
import { InMemoryTransactionRepository } from "@/src/test/fakes/InMemoryTransactionRepository";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
} from "./transactionUseCases";

const own: Transaction = {
  uid: "tx-own",
  userId: "u1",
  valueInCents: 1000,
  transactionType: "outcome",
  createdAt: new Date(2026, 5, 10, 12).toISOString(),
  description: "Mercado",
  categoryId: "cat-1",
};
const foreign: Transaction = { ...own, uid: "tx-foreign", userId: "u2" };

let transactions: InMemoryTransactionRepository;
let categories: InMemoryCategoryRepository;
let deps: { transactions: InMemoryTransactionRepository; categories: InMemoryCategoryRepository };

beforeEach(() => {
  transactions = new InMemoryTransactionRepository();
  categories = new InMemoryCategoryRepository();
  transactions.seed(own, foreign);
  categories.seed(
    { uid: "cat-1", userId: "u1", name: "Comida", createdAt: "" },
    { uid: "cat-2", userId: "u2", name: "Outra", createdAt: "" },
  );
  deps = { transactions, categories };
});

describe("listTransactions", () => {
  it("repassa userId e filtros ao repositório", async () => {
    const result = await listTransactions(deps, "u1", { limit: 5 });
    expect(result.data.map((t) => t.uid)).toEqual(["tx-own"]);
    expect(transactions.calls.listForUser).toEqual([
      { userId: "u1", filters: { limit: 5 } },
    ]);
  });

  it.each([0, 1.5, -1, Number.NaN])("rejeita limit %s sem consultar o repositório", async (limit) => {
    await expect(
      listTransactions(deps, "u1", { limit }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(transactions.calls.listForUser).toHaveLength(0);
  });

  it("aceita limit 1", async () => {
    await listTransactions(deps, "u1", { limit: 1 });
    expect(transactions.calls.listForUser).toHaveLength(1);
  });

  it("rejeita userId vazio", async () => {
    await expect(listTransactions(deps, "  ")).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it.each([0, -1, 1.5, Number.NaN])("rejeita limit %s", async (limit) => {
    await expect(
      listTransactions(deps, "u1", { limit }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(transactions.calls.listForUser).toHaveLength(0);
  });
});

describe("getTransaction", () => {
  it("retorna a transação do usuário", async () => {
    expect((await getTransaction(deps, "u1", "tx-own")).uid).toBe("tx-own");
  });

  it("NotFoundError se não existe", async () => {
    await expect(getTransaction(deps, "u1", "nope")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("NotFoundError se é de outro usuário", async () => {
    await expect(
      getTransaction(deps, "u1", "tx-foreign"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("createTransaction", () => {
  const base = {
    userId: "u1",
    valueInCents: 2500,
    transactionType: "income" as const,
  };

  it("cria com dados normalizados", async () => {
    const created = await createTransaction(deps, {
      ...base,
      description: "  Salário  ",
      categoryId: "cat-1",
    });
    expect(created.description).toBe("Salário");
    expect(transactions.calls.create[0]).toEqual({
      ...base,
      description: "Salário",
      categoryId: "cat-1",
    });
  });

  it("descrição vazia vira undefined", async () => {
    await createTransaction(deps, { ...base, description: "   " });
    expect(transactions.calls.create[0].description).toBeUndefined();
  });

  it.each([0, -100, 10.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejeita valor %s",
    async (valueInCents) => {
      await expect(
        createTransaction(deps, { ...base, valueInCents }),
      ).rejects.toBeInstanceOf(ValidationError);
      expect(transactions.writeCount).toBe(0);
    },
  );

  it("mensagem de valor zero", async () => {
    await expect(
      createTransaction(deps, { ...base, valueInCents: 0 }),
    ).rejects.toThrow("O valor deve ser maior que zero.");
  });

  it("rejeita tipo inválido", async () => {
    await expect(
      createTransaction(deps, {
        ...base,
        transactionType: "transfer" as never,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejeita userId vazio", async () => {
    await expect(
      createTransaction(deps, { ...base, userId: "" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejeita categoria inexistente", async () => {
    await expect(
      createTransaction(deps, { ...base, categoryId: "nope" }),
    ).rejects.toThrow("Categoria inválida.");
    expect(transactions.writeCount).toBe(0);
  });

  it("rejeita categoria de outro usuário", async () => {
    await expect(
      createTransaction(deps, { ...base, categoryId: "cat-2" }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(transactions.writeCount).toBe(0);
  });
});

describe("updateTransaction", () => {
  it("atualiza só os campos presentes, normalizados", async () => {
    await updateTransaction(deps, "u1", "tx-own", {
      valueInCents: 500,
      description: "  Padaria ",
    });
    expect(transactions.calls.update).toEqual([
      { id: "tx-own", data: { valueInCents: 500, description: "Padaria" } },
    ]);
  });

  it("descarta userId vindo em runtime", async () => {
    await updateTransaction(deps, "u1", "tx-own", {
      valueInCents: 500,
      userId: "u2",
    } as never);
    expect(transactions.calls.update[0].data).toEqual({ valueInCents: 500 });
  });

  it("preserva chaves com undefined (remover campo)", async () => {
    await updateTransaction(deps, "u1", "tx-own", {
      receipt: undefined,
      categoryId: undefined,
    });
    const data = transactions.calls.update[0].data;
    expect("receipt" in data).toBe(true);
    expect("categoryId" in data).toBe(true);
    expect(categories.calls.getById).toHaveLength(0);
  });

  it("valida categoria presente", async () => {
    await expect(
      updateTransaction(deps, "u1", "tx-own", { categoryId: "cat-2" }),
    ).rejects.toThrow("Categoria inválida.");
    await updateTransaction(deps, "u1", "tx-own", { categoryId: "cat-1" });
    expect(transactions.calls.update).toHaveLength(1);
  });

  it.each([0, -1, 10.5, Number.NaN])("rejeita valor %s", async (v) => {
    await expect(
      updateTransaction(deps, "u1", "tx-own", { valueInCents: v }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(transactions.writeCount).toBe(0);
  });

  it("rejeita tipo inválido", async () => {
    await expect(
      updateTransaction(deps, "u1", "tx-own", {
        transactionType: "x" as never,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("NotFoundError para transação alheia ou inexistente, sem escrita", async () => {
    await expect(
      updateTransaction(deps, "u1", "tx-foreign", { valueInCents: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      updateTransaction(deps, "u1", "nope", { valueInCents: 1 }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(transactions.writeCount).toBe(0);
  });
});

describe("updateTransaction (bordas)", () => {
  it("description só com espaços vira undefined, mantendo a chave para remover", async () => {
    await updateTransaction(deps, "u1", "tx-own", { description: "   " });
    const data = transactions.calls.update[0].data;
    expect("description" in data).toBe(true);
    expect(data.description).toBeUndefined();
  });

  it("categoryId só com espaços remove sem consultar categoria", async () => {
    await updateTransaction(deps, "u1", "tx-own", { categoryId: "   " });
    const data = transactions.calls.update[0].data;
    expect("categoryId" in data).toBe(true);
    expect(data.categoryId).toBeUndefined();
    expect(categories.calls.getById).toHaveLength(0);
  });

  it("categoryId com undefined remove a categoria no repositório", async () => {
    await updateTransaction(deps, "u1", "tx-own", { categoryId: undefined });
    expect(transactions.items.get("tx-own")).not.toHaveProperty("categoryId");
  });

  it("categoryId é trimado antes de validar e gravar", async () => {
    await updateTransaction(deps, "u1", "tx-own", { categoryId: " cat-1 " });
    expect(transactions.calls.update[0].data).toEqual({ categoryId: "cat-1" });
  });

  it("valueInCents presente porém undefined é rejeitado", async () => {
    await expect(
      updateTransaction(deps, "u1", "tx-own", { valueInCents: undefined }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(transactions.writeCount).toBe(0);
  });

  it("não valida nem escreve campos ausentes: patch vazio vai vazio", async () => {
    await updateTransaction(deps, "u1", "tx-own", {});
    expect(transactions.calls.update[0].data).toEqual({});
  });

  it("rejeita userId vazio antes de ler o repositório", async () => {
    await expect(
      updateTransaction(deps, " ", "tx-own", { valueInCents: 1 }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(transactions.writeCount).toBe(0);
  });
});

describe("createTransaction (bordas)", () => {
  it("description só com espaços é omitida", async () => {
    await createTransaction(deps, {
      userId: "u1",
      valueInCents: 100,
      transactionType: "income",
      description: "   ",
    });
    expect(transactions.calls.create[0]).not.toHaveProperty("description");
  });

  it("categoryId só com espaços é omitida sem consultar categoria", async () => {
    await createTransaction(deps, {
      userId: "u1",
      valueInCents: 100,
      transactionType: "income",
      categoryId: "  ",
    });
    expect(transactions.calls.create[0]).not.toHaveProperty("categoryId");
    expect(categories.calls.getById).toHaveLength(0);
  });
});

describe("deleteTransaction", () => {
  it("remove a transação do usuário", async () => {
    await deleteTransaction(deps, "u1", "tx-own");
    expect(transactions.calls.delete).toEqual(["tx-own"]);
  });

  it("NotFoundError para alheia ou inexistente, sem escrita", async () => {
    await expect(
      deleteTransaction(deps, "u1", "tx-foreign"),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(deleteTransaction(deps, "u1", "nope")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(transactions.writeCount).toBe(0);
  });
});
