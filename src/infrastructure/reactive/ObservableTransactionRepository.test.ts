import { TransactionChange } from "@domain/transactions/events/TransactionChange";
import { InMemoryTransactionRepository } from "@/tests/fakes/InMemoryTransactionRepository";
import { ObservableTransactionRepository } from "./ObservableTransactionRepository";
import { describe, expect, it } from "vitest";

function setup() {
  const inner = new InMemoryTransactionRepository();
  const repository = new ObservableTransactionRepository(inner);
  const changes: TransactionChange[] = [];
  const subscription = repository.changes$.subscribe((change) =>
    changes.push(change),
  );
  return { inner, repository, changes, subscription };
}

describe("ObservableTransactionRepository", () => {
  it("emite um evento depois de criar, editar e excluir", async () => {
    const { repository, changes } = setup();

    const created = await repository.create({
      userId: "u1",
      valueInCents: 500,
      transactionType: "outcome",
    });
    await repository.update(created.uid, { description: "mercado" });
    await repository.delete(created.uid);

    expect(changes).toEqual([
      { type: "created", transaction: created },
      {
        type: "updated",
        transactionId: created.uid,
        data: { description: "mercado" },
      },
      { type: "deleted", transactionId: created.uid },
    ]);
  });

  it("não emite nada quando a escrita falha", async () => {
    const { inner, repository, changes } = setup();
    inner.update = async () => {
      throw new Error("falhou");
    };

    await expect(repository.update("t1", { description: "x" })).rejects.toThrow(
      "falhou",
    );
    expect(changes).toEqual([]);
  });

  it("leituras passam direto, sem emitir eventos", async () => {
    const { inner, repository, changes } = setup();
    inner.seed({
      uid: "t1",
      userId: "u1",
      valueInCents: 100,
      transactionType: "income",
      createdAt: "2026-06-15T12:00:00.000Z",
    });

    await repository.getById("t1");
    const page = await repository.listForUser("u1", { limit: 10 });

    expect(page.data.map((item) => item.uid)).toEqual(["t1"]);
    expect(inner.calls.listForUser).toHaveLength(1);
    expect(changes).toEqual([]);
  });

  it("para de avisar quem cancelou a inscrição", async () => {
    const { repository, changes, subscription } = setup();
    subscription.unsubscribe();

    await repository.delete("t1");

    expect(changes).toEqual([]);
  });
});
