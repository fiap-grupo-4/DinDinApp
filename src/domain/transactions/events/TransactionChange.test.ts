import { Transaction } from "../entities/Transaction";
import { applyTransactionChange } from "./TransactionChange";
import { describe, expect, it } from "vitest";

function tx(uid: string, description = uid): Transaction {
  return {
    uid,
    userId: "u1",
    valueInCents: 100,
    transactionType: "income",
    createdAt: "2026-06-15T12:00:00.000Z",
    description,
  };
}

describe("applyTransactionChange", () => {
  const list = [tx("a"), tx("b"), tx("c")];

  it("coloca a transação criada no topo", () => {
    const created = tx("novo");
    expect(
      applyTransactionChange(list, { type: "created", transaction: created }),
    ).toEqual([created, ...list]);
  });

  it("não duplica uma transação que já está na lista", () => {
    const result = applyTransactionChange(list, {
      type: "created",
      transaction: tx("b", "atualizada"),
    });
    expect(result.map((item) => item.uid)).toEqual(["b", "a", "c"]);
    expect(result[0].description).toBe("atualizada");
  });

  it("aplica a edição só na transação alterada", () => {
    const result = applyTransactionChange(list, {
      type: "updated",
      transactionId: "b",
      data: { description: "editada" },
    });
    expect(result[1].description).toBe("editada");
    expect(result[0]).toBe(list[0]);
    expect(result[2]).toBe(list[2]);
  });

  it("remove a transação excluída", () => {
    expect(
      applyTransactionChange(list, { type: "deleted", transactionId: "a" }),
    ).toEqual([list[1], list[2]]);
  });

  it("não altera a lista original", () => {
    const copy = [...list];
    applyTransactionChange(list, { type: "deleted", transactionId: "a" });
    expect(list).toEqual(copy);
  });
});
