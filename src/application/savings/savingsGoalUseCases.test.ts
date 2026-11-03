import { SavingsGoal } from "@domain/savings/entities/SavingsGoal";
import { NotFoundError, ValidationError } from "@domain/shared/errors";
import { InMemorySavingsGoalRepository } from "@/src/test/fakes/InMemorySavingsGoalRepository";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createSavingsGoal,
  deleteSavingsGoal,
  listSavingsGoals,
  updateSavingsGoal,
} from "./savingsGoalUseCases";

const own: SavingsGoal = {
  uid: "g1",
  userId: "u1",
  title: "Viagem",
  currentValueInCents: 1000,
  targetValueInCents: 5000,
  createdAt: "",
};
const foreign: SavingsGoal = { ...own, uid: "g2", userId: "u2" };

let repo: InMemorySavingsGoalRepository;

beforeEach(() => {
  repo = new InMemorySavingsGoalRepository();
  repo.seed(own, foreign);
});

describe("listSavingsGoals", () => {
  it("lista as metas do usuário", async () => {
    expect((await listSavingsGoals(repo, "u1")).map((g) => g.uid)).toEqual([
      "g1",
    ]);
  });

  it("rejeita userId vazio", async () => {
    await expect(listSavingsGoals(repo, " ")).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});

describe("createSavingsGoal", () => {
  const base = {
    userId: "u1",
    title: "Carro",
    currentValueInCents: 0,
    targetValueInCents: 10000,
  };

  it("cria com título trimado", async () => {
    await createSavingsGoal(repo, { ...base, title: "  Carro  " });
    expect(repo.calls.create[0]).toEqual(base);
  });

  it("rejeita título curto", async () => {
    await expect(
      createSavingsGoal(repo, { ...base, title: " ab " }),
    ).rejects.toThrow('O campo "Título" deve ter no mínimo 3 caracteres.');
    expect(repo.writeCount).toBe(0);
  });

  it.each([0, -1, 10.5, Number.NaN])("rejeita meta %s", async (v) => {
    await expect(
      createSavingsGoal(repo, { ...base, targetValueInCents: v }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([-1, 1.5, Number.NaN])("rejeita valor atual %s", async (v) => {
    await expect(
      createSavingsGoal(repo, { ...base, currentValueInCents: v }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("aceita valor atual igual à meta", async () => {
    await createSavingsGoal(repo, { ...base, currentValueInCents: 10000 });
    expect(repo.calls.create).toHaveLength(1);
  });

  it("rejeita atual maior que a meta", async () => {
    await expect(
      createSavingsGoal(repo, { ...base, currentValueInCents: 10001 }),
    ).rejects.toThrow("O valor atual não pode ser maior que a meta.");
    expect(repo.writeCount).toBe(0);
  });

  it("rejeita userId vazio", async () => {
    await expect(
      createSavingsGoal(repo, { ...base, userId: "" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("updateSavingsGoal", () => {
  it("repassa só o data normalizado", async () => {
    await updateSavingsGoal(repo, "u1", "g1", {
      title: "  Viagem longa ",
      currentValueInCents: 2000,
    });
    expect(repo.calls.update).toEqual([
      {
        id: "g1",
        data: { title: "Viagem longa", currentValueInCents: 2000 },
      },
    ]);
  });

  it("valida o merge: atual novo maior que a meta salva", async () => {
    await expect(
      updateSavingsGoal(repo, "u1", "g1", { currentValueInCents: 6000 }),
    ).rejects.toThrow("O valor atual não pode ser maior que a meta.");
    expect(repo.writeCount).toBe(0);
  });

  it("valida o merge: meta nova menor que o atual salvo", async () => {
    await expect(
      updateSavingsGoal(repo, "u1", "g1", { targetValueInCents: 500 }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejeita título curto", async () => {
    await expect(
      updateSavingsGoal(repo, "u1", "g1", { title: "a" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("NotFoundError para alheia ou inexistente", async () => {
    await expect(
      updateSavingsGoal(repo, "u1", "g2", { title: "Novo título" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      updateSavingsGoal(repo, "u1", "nope", { title: "Novo título" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.writeCount).toBe(0);
  });
});

describe("deleteSavingsGoal", () => {
  it("remove a meta do usuário", async () => {
    await deleteSavingsGoal(repo, "u1", "g1");
    expect(repo.calls.delete).toEqual(["g1"]);
  });

  it("NotFoundError para alheia", async () => {
    await expect(deleteSavingsGoal(repo, "u1", "g2")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(repo.writeCount).toBe(0);
  });
});
